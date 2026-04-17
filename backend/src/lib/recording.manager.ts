import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { prisma } from './prisma.js';

import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RECORDING_BASE_PATH = process.env.RECORDING_BASE_PATH || path.join(__dirname, '..', '..', '..', 'recordings');
const RECORDING_RTP_PORT_MIN = parseInt(process.env.RECORDING_RTP_PORT_MIN || '20000', 10);
const RECORDING_RTP_PORT_MAX = parseInt(process.env.RECORDING_RTP_PORT_MAX || '20200', 10);

interface RtpPortInfo {
    port: number;
    kind: 'audio' | 'video';
    trackType: string;
}

interface RecordingSession {
    interview_id: string;
    ffmpegProcess: ReturnType<typeof spawn> | null;
    plainTransports: Map<string, any>;
    consumers: Map<string, any>;
    rtpPorts: Map<string, RtpPortInfo>;
    outputPath: string;
    logPath: string;
    startedAt: Date;
    portPool: Set<number>;
    retryCount: number;
}

const activeSessions = new Map<string, RecordingSession>();

const globalPortPool = new Set<number>();

function allocateGlobalPort(session: RecordingSession): number {
    for (let port = RECORDING_RTP_PORT_MIN; port <= RECORDING_RTP_PORT_MAX; port++) {
        if (!globalPortPool.has(port) && !session.portPool.has(port)) {
            globalPortPool.add(port);
            return port;
        }
    }
    throw new Error('RTP port pool exhausted');
}

function releaseGlobalPort(port: number): void {
    globalPortPool.delete(port);
}

async function writeSdpFile(interview_id: string, producer_id: string, port: number, kind: 'audio' | 'video', rtpParameters: any): Promise<string> {
    const payloadType = rtpParameters.codecs?.[0]?.payloadType || (kind === 'audio' ? 100 : 101);
    const codecName = kind === 'audio' ? 'OPUS' : 'VP8';
    const clockRate = kind === 'audio' ? 48000 : 90000;
    const channels = kind === 'audio' ? '2' : null;

    const sdp = [
        'v=0',
        'o=- 0 0 IN IP4 127.0.0.1',
        's=mediasoup',
        `c=IN IP4 127.0.0.1`,
        't=0 0',
        `m=${kind} ${port} RTP/AVP ${payloadType}`,
        `a=rtpmap:${payloadType} ${codecName}/${clockRate}${channels ? `/${channels}` : ''}`,
        'a=recvonly'
    ].join('\r\n');

    const sdpDir = path.join(RECORDING_BASE_PATH, interview_id);
    const sdpPath = path.join(sdpDir, `${producer_id}.sdp`);
    await fs.promises.mkdir(sdpDir, { recursive: true });
    await fs.promises.writeFile(sdpPath, sdp);
    return sdpPath;
}

async function startRecording(interviewId: string, router: any): Promise<RecordingSession> {
    if (activeSessions.has(interviewId)) {
        throw new Error(`Recording session already exists for interview ${interviewId}`);
    }

    const outputDir = path.join(RECORDING_BASE_PATH, interviewId);
    fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, 'recording.mp4');
    const logPath = path.join(outputDir, 'recording.log');

    try {
        await prisma.interviewRecording.create({
            data: {
                interview_id: interviewId,
                status: 'recording',
                file_path: outputPath,
            },
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            const existing = await prisma.interviewRecording.findUnique({
                where: { interview_id: interviewId },
            });
            if (existing) {
                await prisma.interviewRecording.update({
                    where: { interview_id: interviewId },
                    data: { status: 'recording', file_path: outputPath, started_at: new Date(), completed_at: null, error_message: null, file_size_bytes: null, duration_seconds: null },
                });
            }
        } else {
            throw error;
        }
    }

    const session: RecordingSession = {
        interview_id: interviewId,
        ffmpegProcess: null,
        plainTransports: new Map(),
        consumers: new Map(),
        rtpPorts: new Map(),
        outputPath,
        logPath,
        startedAt: new Date(),
        portPool: new Set(),
        retryCount: 0,
    };

    activeSessions.set(interviewId, session);
    console.log(`[Recording] Started session for interview ${interviewId}`);
    return session;
}

async function addProducerToRecording(interviewId: string, producer: any, router: any): Promise<void> {
    const session = activeSessions.get(interviewId);
    if (!session) {
        return;
    }

    if (session.plainTransports.has(producer.id)) {
        return;
    }

    const allocatedPort = allocateGlobalPort(session);
    session.portPool.add(allocatedPort);

    const plainTransport = await router.createPlainTransport({
        listenIp: { ip: '127.0.0.1', announcedIp: null },
        rtcpMux: false,
        comedia: false,
    });

    await plainTransport.connect({ ip: '127.0.0.1', port: allocatedPort });

    const consumer = await plainTransport.consume({
        producerId: producer.id,
        rtpCapabilities: router.rtpCapabilities,
        paused: false,
    });

    session.plainTransports.set(producer.id, plainTransport);
    session.consumers.set(producer.id, consumer);
    session.rtpPorts.set(producer.id, {
        port: allocatedPort,
        kind: producer.kind,
        trackType: producer.appData?.trackType || producer.kind,
    });

    await consumer.resume();

    console.log(`[Recording] Added producer ${producer.id} (${producer.kind}) to recording on port ${allocatedPort}`);

    const hasAudio = Array.from(session.rtpPorts.values()).some(p => p.kind === 'audio');
    const hasVideo = Array.from(session.rtpPorts.values()).some(p => p.kind === 'video');

    if (hasAudio && hasVideo && !session.ffmpegProcess) {
        await spawnFFmpeg(interviewId);
    }
}

async function spawnFFmpeg(interviewId: string): Promise<void> {
    const session = activeSessions.get(interviewId);
    if (!session) {
        throw new Error(`No recording session for interview ${interviewId}`);
    }

    if (session.ffmpegProcess) {
        return;
    }

    const audioTracks = Array.from(session.rtpPorts.entries()).filter(([_, info]) => info.kind === 'audio');
    const videoTracks = Array.from(session.rtpPorts.entries()).filter(([_, info]) => info.kind === 'video');

    if (audioTracks.length === 0 || videoTracks.length === 0) {
        console.log(`[Recording] Not spawning FFmpeg yet - need at least 1 audio and 1 video track`);
        return;
    }

    const inputArgs: string[] = ['-protocol_whitelist', 'file,pipe,udp,rtp'];

    const sdpInputs: string[] = [];
    for (const [producerId, info] of [...audioTracks, ...videoTracks]) {
        const consumer = session.consumers.get(producerId);
        if (!consumer) continue;

        const sdpPath = await writeSdpFile(interviewId, producerId, info.port, info.kind, consumer.rtpParameters);
        inputArgs.push('-i', sdpPath);
        sdpInputs.push(producerId);
    }

    let filterComplex: string;
    const audioCount = audioTracks.length;
    const videoCount = videoTracks.length;

    const audioIndices: number[] = [];
    const videoIndices: number[] = [];
    const allTracks = [...audioTracks, ...videoTracks];
    sdpInputs.forEach((_, idx) => {
        const track = allTracks[idx];
        if (!track) return;
        const info = track[1];
        if (info.kind === 'audio') {
            audioIndices.push(idx);
        } else {
            videoIndices.push(idx);
        }
    });

    if (audioCount >= 2) {
        const audioLabel = audioIndices.map(i => `[${i}:a]`).join('');
        filterComplex = `${audioLabel}amix=inputs=${audioCount}:duration=longest[aout]`;
    } else {
        filterComplex = `[0:a]acopy[aout]`;
    }

    if (videoCount >= 2) {
        const videoLabel = videoIndices.map(i => `[${i}:v]`).join('');
        filterComplex += `;${videoLabel}hstack=inputs=${videoCount}[vout]`;
    } else {
        const vIdx = videoCount > 0 ? audioCount : 0;
        filterComplex += `;[${vIdx}:v]copy[vout]`;
    }

    const outputArgs = [
        '-map', '[vout]',
        '-map', '[aout]',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '23',
        '-c:a', 'aac',
        '-ar', '44100',
        '-b:a', '128k',
        '-movflags', '+faststart',
        '-y',
        session.outputPath
    ];

    const args = [...inputArgs, '-filter_complex', filterComplex, ...outputArgs];

    console.log(`[Recording] Spawning FFmpeg with args: ${args.join(' ')}`);

    const ffmpeg = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    session.ffmpegProcess = ffmpeg;

    const logStream = fs.createWriteStream(session.logPath, { flags: 'a' });
    ffmpeg.stdout?.pipe(logStream);
    ffmpeg.stderr?.pipe(logStream);

    ffmpeg.on('close', async (code) => {
        console.log(`[Recording] FFmpeg exited with code ${code} for interview ${interviewId}`);
        
        try {
            if (code === 0) {
                const stats = fs.statSync(session.outputPath);
                const duration = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
                await prisma.interviewRecording.update({
                    where: { interview_id: interviewId },
                    data: {
                        status: 'completed',
                        file_size_bytes: stats.size,
                        duration_seconds: duration,
                        completed_at: new Date(),
                    },
                });
            } else {
                const session = activeSessions.get(interviewId);
                if (session && session.retryCount < 1) {
                    console.log(`[Recording] FFmpeg failed. Retrying (Attempt ${session.retryCount + 1})...`);
                    session.retryCount++;
                    session.ffmpegProcess = null;
                    setTimeout(() => {
                        spawnFFmpeg(interviewId).catch(err => {
                            console.error(`[Recording] Retry failed:`, err);
                        });
                    }, 1000);
                    return; // Don't cleanup or mark as failed yet
                }

                let errorMessage = `FFmpeg exited with code ${code}`;
                try {
                    const logContent = fs.readFileSync(session?.logPath || '', 'utf-8');
                    const last500 = logContent.slice(-500);
                    errorMessage = last500 || errorMessage;
                } catch {}
                await prisma.interviewRecording.update({
                    where: { interview_id: interviewId },
                    data: {
                        status: 'failed',
                        error_message: errorMessage,
                        completed_at: new Date(),
                    },
                });
            }
        } catch (err) {
            console.error(`[Recording] Failed to update DB on FFmpeg close:`, err);
        }

        for (const port of session.portPool) {
            releaseGlobalPort(port);
        }
        activeSessions.delete(interviewId);
    });

    ffmpeg.on('error', async (err) => {
        console.error(`[Recording] FFmpeg error for interview ${interviewId}:`, err);
        try {
            await prisma.interviewRecording.update({
                where: { interview_id: interviewId },
                data: {
                    status: 'failed',
                    error_message: err.message,
                    completed_at: new Date(),
                },
            });
        } catch {}
        for (const port of session.portPool) {
            releaseGlobalPort(port);
        }
        activeSessions.delete(interviewId);
    });
}

async function stopRecording(interviewId: string): Promise<void> {
    const session = activeSessions.get(interviewId);
    if (!session) {
        console.log(`[Recording] No active session to stop for interview ${interviewId}`);
        return;
    }

    console.log(`[Recording] Stopping recording for interview ${interviewId}`);

    for (const [producerId, consumer] of session.consumers) {
        try {
            await consumer.close();
        } catch (err) {
            console.error(`[Recording] Error closing consumer ${producerId}:`, err);
        }
    }
    session.consumers.clear();

    for (const [producerId, transport] of session.plainTransports) {
        try {
            transport.close();
        } catch (err) {
            console.error(`[Recording] Error closing transport ${producerId}:`, err);
        }
    }
    session.plainTransports.clear();

    let recordingStatus = 'completed';
    let duration = 0;

    if (session.ffmpegProcess) {
        session.ffmpegProcess.kill('SIGTERM');

        await new Promise<void>((resolve) => {
            const timeout = setTimeout(() => {
                if (session.ffmpegProcess) {
                    session.ffmpegProcess.kill('SIGKILL');
                }
                resolve();
            }, 10000);

            session.ffmpegProcess!.on('exit', () => {
                clearTimeout(timeout);
                resolve();
            });
        });

        session.ffmpegProcess = null;
    } else {
        recordingStatus = 'completed';
    }

    for (const port of session.portPool) {
        releaseGlobalPort(port);
    }
    session.portPool.clear();

    try {
        const stats = fs.statSync(session.outputPath);
        duration = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
        await prisma.interviewRecording.update({
            where: { interview_id: interviewId },
            data: {
                status: recordingStatus,
                file_size_bytes: stats.size,
                duration_seconds: duration,
                completed_at: new Date(),
            },
        });
    } catch (err) {
        const duration = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
        await prisma.interviewRecording.update({
            where: { interview_id: interviewId },
            data: {
                status: recordingStatus,
                duration_seconds: duration,
                completed_at: new Date(),
            },
        }).catch(dbErr => {
            console.error(`[Recording] Failed to update DB after stop:`, dbErr);
        });
    }

    activeSessions.delete(interviewId);
    console.log(`[Recording] Stopped recording for interview ${interviewId}`);
}

async function removeProducerFromRecording(interviewId: string, producerId: string): Promise<void> {
    const session = activeSessions.get(interviewId);
    if (!session) {
        return;
    }

    const rtpInfo = session.rtpPorts.get(producerId);
    if (rtpInfo) {
        releaseGlobalPort(rtpInfo.port);
        session.portPool.delete(rtpInfo.port);
    }

    const consumer = session.consumers.get(producerId);
    if (consumer) {
        try {
            await consumer.close();
        } catch (err) {
            console.error(`[Recording] Error closing consumer ${producerId}:`, err);
        }
        session.consumers.delete(producerId);
    }

    const transport = session.plainTransports.get(producerId);
    if (transport) {
        try {
            transport.close();
        } catch (err) {
            console.error(`[Recording] Error closing transport ${producerId}:`, err);
        }
        session.plainTransports.delete(producerId);
    }

    session.rtpPorts.delete(producerId);

    console.log(`[Recording] Removed producer ${producerId} from recording`);

    // Clean up SDP file
    const sdpPath = path.join(RECORDING_BASE_PATH, interviewId, `${producerId}.sdp`);
    try {
        if (fs.existsSync(sdpPath)) {
            fs.unlinkSync(sdpPath);
        }
    } catch {}
}

function getRecordingStatus(interviewId: string): Promise<{ status: string; started_at?: Date; completed_at?: Date; duration_seconds?: number; file_size_bytes?: number; file_path?: string }> {
    const session = activeSessions.get(interviewId);
    if (session) {
        return Promise.resolve({
            status: 'recording',
            started_at: session.startedAt,
        });
    }

    return prisma.interviewRecording.findUnique({
        where: { interview_id: interviewId },
    }).then(rec => {
        if (!rec) {
            return { status: 'not_found' };
        }
    const result: { status: string; started_at?: Date; completed_at?: Date; duration_seconds?: number; file_size_bytes?: number; file_path?: string } = {
        status: rec.status,
    };
    if (rec.started_at) result.started_at = rec.started_at;
    if (rec.completed_at) result.completed_at = rec.completed_at;
    if (rec.duration_seconds) result.duration_seconds = rec.duration_seconds;
    if (rec.file_size_bytes) result.file_size_bytes = Number(rec.file_size_bytes);
    if (rec.file_path) result.file_path = rec.file_path;
    return result;
    });
}

async function shutdownAllRecordings(): Promise<void> {
    console.log('[Recording] Shutting down all active recordings...');
    const shutdownPromises: Promise<void>[] = [];
    for (const [interviewId] of activeSessions) {
        shutdownPromises.push(stopRecording(interviewId));
    }
    await Promise.allSettled(shutdownPromises);
    console.log('[Recording] All recordings shut down');
}

process.on('SIGTERM', async () => {
    await shutdownAllRecordings();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await shutdownAllRecordings();
    process.exit(0);
});

export {
    startRecording,
    addProducerToRecording,
    stopRecording,
    removeProducerFromRecording,
    getRecordingStatus,
    writeSdpFile,
    shutdownAllRecordings,
    activeSessions,
};