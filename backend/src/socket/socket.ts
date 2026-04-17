import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { createRoomRouter, createWebRtcTransport, transports, producers, consumers, routers } from "../lib/mediasoup.js";
import { startRecording, addProducerToRecording, stopRecording, removeProducerFromRecording, activeSessions } from "../lib/recording.manager.js";

let ioInstance: Server | null = null;

interface AuthenticatedSocket extends Socket {
    userId?: string;
    userRole?: string;
    userName?: string;
}

interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: string;
}

export function createSocketServer(httpServer: HttpServer): Server {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || "*",
            credentials: true,
        },
        path: "/socket.io",
    });

    // JWT authentication middleware
    io.use(async (socket: AuthenticatedSocket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decoded = jwt.verify(token, env.JWT_SECRET) as {
                id: string;
                role: string;
                cnid?: string;
            };

            // Fetch user name based on role
            let userName = "Unknown";
            if (decoded.role === "STUDENT") {
                const student = await prisma.student.findUnique({
                    where: { userId: decoded.id },
                    select: { name: true },
                });
                userName = student?.name || "Student";
            } else if (decoded.role === "RECRUITER") {
                const recruiter = await prisma.recruiter.findUnique({
                    where: { userId: decoded.id },
                    select: { name: true },
                });
                userName = recruiter?.name || "Recruiter";
            }

            socket.userId = decoded.id;
            socket.userRole = decoded.role;
            socket.userName = userName;
            next();
        } catch {
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", (rawSocket: Socket) => {
        const socket = rawSocket as AuthenticatedSocket;
        console.log(`[Socket] Connected: ${socket.userId} (${socket.userRole})`);

        // ─── Join Interview Room ───
        socket.on("join-room", async (data: { interviewId: string }) => {
            const { interviewId } = data;

            try {
                // Validate user is a participant
                const interview = await prisma.interview.findUnique({
                    where: { id: interviewId },
                    include: {
                        student: { select: { userId: true, name: true } },
                        recruiter: { select: { userId: true, name: true } },
                    },
                });

                if (!interview) {
                    socket.emit("error", { message: "Interview not found" });
                    return;
                }

                const isStudent = interview.student.userId === socket.userId;
                const isRecruiter = interview.recruiter.userId === socket.userId;

                if (!isStudent && !isRecruiter) {
                    socket.emit("error", { message: "Not authorized for this interview" });
                    return;
                }

                const roomId = `interview-${interviewId}`;
                socket.join(roomId);

                // Notify room that someone joined
                socket.to(roomId).emit("peer-joined", {
                    userId: socket.userId,
                    userName: socket.userName,
                    role: socket.userRole,
                });

                // Send current room members to the joiner
                const roomSockets = await io.in(roomId).fetchSockets();
                const members = roomSockets.map((s) => {
                    const authS = s as unknown as AuthenticatedSocket;
                    return {
                        userId: authS.userId,
                        userName: authS.userName,
                        role: authS.userRole,
                    };
                });
                socket.emit("room-joined", {
                    interviewId,
                    members,
                    interview: {
                        id: interview.id,
                        role: interview.role,
                        type: interview.type,
                        status: interview.status,
                        scheduledAt: interview.scheduledAt,
                        studentName: interview.student.name,
                        recruiterName: interview.recruiter.name,
                    },
                });

                // Send existing producers so late-joiner can consume them
                const existingProducers = Array.from(producers.values())
                    .filter(p => p.appData.interviewId === interviewId && p.appData.userId !== socket.userId)
                    .map(p => ({ producerId: p.id, userId: p.appData.userId }));
                if (existingProducers.length > 0) {
                    socket.emit("existing-producers", { producers: existingProducers });
                }

                // Update interview status to IN_PROGRESS if both participants are present
                if (roomSockets.length >= 2 && interview.status === "SCHEDULED") {
                    await prisma.interview.update({
                        where: { id: interviewId },
                        data: { status: "IN_PROGRESS" },
                    });
                    io.to(roomId).emit("interview-status", { status: "IN_PROGRESS" });
                }

                console.log(`[Socket] ${socket.userName} joined room ${roomId}`);
            } catch (err) {
                console.error("[Socket] join-room error:", err);
                socket.emit("error", { message: "Failed to join room" });
            }
        });

        // ─── Mediasoup Signaling ───
        
        socket.on("getRouterRtpCapabilities", async (data: { interviewId: string }, callback) => {
            try {
                const router = await createRoomRouter(data.interviewId);
                callback({ rtpCapabilities: router.rtpCapabilities });
            } catch (err: any) {
                callback({ error: err.message });
            }
        });

        socket.on("createWebRtcTransport", async (data: { interviewId: string }, callback) => {
            try {
                const router = await createRoomRouter(data.interviewId);
                const transport = await createWebRtcTransport(router);
                // Also listen for consumer/producer updates on same transport socket
                
                callback({
                    id: transport.id,
                    iceParameters: transport.iceParameters,
                    iceCandidates: transport.iceCandidates,
                    dtlsParameters: transport.dtlsParameters
                });
            } catch (err: any) {
                callback({ error: err.message });
            }
        });

        socket.on("connectWebRtcTransport", async (data: { transportId: string, dtlsParameters: any }, callback) => {
            try {
                const transport = transports.get(data.transportId);
                if (!transport) throw new Error("Transport not found");
                
                await transport.connect({ dtlsParameters: data.dtlsParameters });
                callback({ success: true });
            } catch (err: any) {
                callback({ error: err.message });
            }
        });

        socket.on("produce", async (data: { interviewId: string, transportId: string, kind: any, rtpParameters: any }, callback) => {
            try {
                const transport = transports.get(data.transportId);
                if (!transport) throw new Error("Transport not found");
                
                const producer = await transport.produce({ kind: data.kind, rtpParameters: data.rtpParameters });
                producer.appData.userId = socket.userId;
                producer.appData.interviewId = data.interviewId;
                producers.set(producer.id, producer);

                const roomId = `interview-${data.interviewId}`;
                socket.to(roomId).emit("new-producer", { producerId: producer.id, userId: socket.userId });

                // RECORDING HOOK — tap new producer into recording pipeline
                const recordingSession = activeSessions.get(data.interviewId);
                if (recordingSession) {
                    const router = await createRoomRouter(data.interviewId);
                    if (router) {
                        await addProducerToRecording(data.interviewId, producer, router);
                    }
                }

                callback({ id: producer.id });
            } catch (err: any) {
                callback({ error: err.message });
            }
        });

        socket.on("consume", async (data: { interviewId: string, transportId: string, producerId: string, rtpCapabilities: any }, callback) => {
            try {
                const transport = transports.get(data.transportId);
                const router = await createRoomRouter(data.interviewId);
                
                if (!transport || !router) throw new Error("Transport or Router not found");
                
                if (!router.canConsume({ producerId: data.producerId, rtpCapabilities: data.rtpCapabilities })) {
                    throw new Error("Cannot consume");
                }

                const consumer = await transport.consume({
                    producerId: data.producerId,
                    rtpCapabilities: data.rtpCapabilities,
                    paused: true,
                });

                consumers.set(consumer.id, consumer);

                consumer.on("transportclose", () => {
                   consumers.delete(consumer.id);
                });

                consumer.on("producerclose", () => {
                   consumers.delete(consumer.id);
                   socket.emit("consumer-closed", { consumerId: consumer.id });

                   // RECORDING HOOK — remove track from recording when producer closes
                   removeProducerFromRecording(data.interviewId, data.producerId).catch(err => {
                       console.error("[Socket] Error removing producer from recording:", err);
                   });
                });

                callback({
                    id: consumer.id,
                    producerId: data.producerId,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters
                });
            } catch (err: any) {
                console.error("Consume error:", err);
                callback({ error: err.message });
            }
        });
        
        socket.on("resume-consumer", async (data: { consumerId: string }, callback) => {
            const consumer = consumers.get(data.consumerId);
            if (consumer) {
                await consumer.resume();
                callback?.({ success: true });
            }
        });

        socket.on("getProducers", (data: { interviewId: string }, callback) => {
             const producerList = Array.from(producers.values())
                 .filter(p => p.appData.interviewId === data.interviewId && p.appData.userId !== socket.userId)
                 .map(p => ({
                     producerId: p.id,
                     userId: p.appData.userId
                 }));
             callback({ producers: producerList });
        });

        // ─── Chat Messages ───
        socket.on("chat-message", (data: { interviewId: string; text: string }) => {
            const roomId = `interview-${data.interviewId}`;
            const message: ChatMessage = {
                id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                senderId: socket.userId!,
                senderName: socket.userName!,
                text: data.text,
                timestamp: new Date().toISOString(),
            };
            io.to(roomId).emit("chat-message", message);
        });

        // ─── Mode Sync (synchronized view between participants) ───
        socket.on("mode-change", (data: { interviewId: string; mode: string }) => {
            const roomId = `interview-${data.interviewId}`;
            socket.to(roomId).emit("mode-change", {
                mode: data.mode,
                changedBy: socket.userName,
            });
        });

        // ─── Code Arena Submission Rooms ───
        socket.on('join_submission', ({ submissionId }) => {
            socket.join(`submission:${submissionId}`);
            console.log(`[Socket] User ${socket.userId} joined submission room: submission:${submissionId}`);
        });
        socket.on('leave_submission', ({ submissionId }) => {
            socket.leave(`submission:${submissionId}`);
            console.log(`[Socket] User ${socket.userId} left submission room: submission:${submissionId}`);
        });

        // ─── Code Sync ───
        socket.on("code-sync", (data: { interviewId: string; code: string; language: string }) => {
            const roomId = `interview-${data.interviewId}`;
            socket.to(roomId).emit("code-sync", {
                code: data.code,
                language: data.language,
                userId: socket.userId,
            });
        });

        // ─── Whiteboard Sync ───
        socket.on("whiteboard-sync", (data: { interviewId: string; elements: any[] }) => {
            const roomId = `interview-${data.interviewId}`;
            socket.to(roomId).emit("whiteboard-sync", {
                elements: data.elements,
                userId: socket.userId,
            });
        });

        // ─── Push Question (Recruiter → Student) ───
        socket.on("push-question", (data: { interviewId: string; question: any }) => {
            if (socket.userRole !== "RECRUITER") return;
            const roomId = `interview-${data.interviewId}`;
            socket.to(roomId).emit("question-pushed", {
                question: data.question,
                pushedBy: socket.userName,
            });
        });

        // ─── End Interview ───
        socket.on("end-interview", async (data: { interviewId: string }) => {
            const roomId = `interview-${data.interviewId}`;
            try {
                await prisma.interview.update({
                    where: { id: data.interviewId },
                    data: { status: "COMPLETED" },
                });
                io.to(roomId).emit("interview-ended", {
                    endedBy: socket.userName,
                    role: socket.userRole,
                });

                // RECORDING HOOK — stop recording when interview officially ends
                await stopRecording(data.interviewId);
            } catch (err) {
                console.error("[Socket] end-interview error:", err);
            }
        });

        // ─── Recording Controls (Recruiter only) ───
        socket.on("start-recording", async (data: { interviewId: string }, callback) => {
            try {
                if (socket.userRole !== "RECRUITER") {
                    callback?.({ error: "Only recruiter can start recording" });
                    return;
                }

                if (activeSessions.has(data.interviewId)) {
                    callback?.({ error: "Recording already in progress" });
                    return;
                }

                const interview = await prisma.interview.findUnique({
                    where: { id: data.interviewId },
                });

                if (!interview) {
                    callback?.({ error: "Interview not found" });
                    return;
                }

                const roomId = `interview-${data.interviewId}`;
                const router = await createRoomRouter(data.interviewId);
                await startRecording(data.interviewId, router);

                // Capture any producers that already exist in the room
                for (const [, producer] of producers) {
                    if (producer.appData.interviewId === data.interviewId) {
                        await addProducerToRecording(data.interviewId, producer, router);
                    }
                }

                io.to(roomId).emit("recording-started", { interviewId: data.interviewId });
                callback?.({ success: true });
            } catch (err: any) {
                console.error("[Socket] start-recording error:", err);
                callback?.({ error: err.message });
            }
        });

        socket.on("stop-recording", async (data: { interviewId: string }, callback) => {
            try {
                if (socket.userRole !== "RECRUITER") {
                    callback?.({ error: "Only recruiter can stop recording" });
                    return;
                }

                const session = activeSessions.get(data.interviewId);
                if (!session) {
                    callback?.({ error: "No active recording" });
                    return;
                }

                const roomId = `interview-${data.interviewId}`;
                await stopRecording(data.interviewId);
                io.to(roomId).emit("recording-stopped", { interviewId: data.interviewId });
                callback?.({ success: true });
            } catch (err: any) {
                console.error("[Socket] stop-recording error:", err);
                callback?.({ error: err.message });
            }
        });

        // ─── Disconnect ───
        socket.on("disconnect", () => {
            console.log(`[Socket] Disconnected: ${socket.userId}`);
            // Notify all rooms this socket was in
            for (const room of socket.rooms) {
                if (room.startsWith("interview-")) {
                    socket.to(room).emit("peer-left", {
                        userId: socket.userId,
                        userName: socket.userName,
                    });
                }
            }
        });
    });

    ioInstance = io;
    return io;
}

export function getIo() {
    return ioInstance;
}
