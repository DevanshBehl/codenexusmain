import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { createRoomRouter, createWebRtcTransport, transports, producers, consumers, routers } from "../lib/mediasoup.js";
import { startRecording, addProducerToRecording, stopRecording, removeProducerFromRecording, activeSessions } from "../lib/recording.manager.js";
import * as percentileService from "../modules/contest/percentile.service.js";

// Memory caches for Phase 2 Late-Joiner Hydration
const roomWhiteboards = new Map<string, any[]>();
const roomYjsDocs = new Map<string, Buffer[]>();

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

                // Phase 2: Hydrate late joiners with existing presentation states
                if (roomWhiteboards.has(interviewId)) {
                    socket.emit("whiteboard-sync", {
                        elements: roomWhiteboards.get(interviewId),
                        userId: "system"
                    });
                }
                
                if (roomYjsDocs.has(interviewId)) {
                    socket.emit("yjs-state", {
                        updates: roomYjsDocs.get(interviewId)
                    });
                }

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
        socket.on("chat-message", async (data: { interviewId: string; text: string }) => {
            if (!socket.userId || !data.interviewId || !data.text?.trim()) return;
            const roomId = `interview-${data.interviewId}`;

            try {
                const savedMsg = await prisma.interviewMessage.create({
                    data: {
                        interviewId: data.interviewId,
                        senderId: socket.userId,
                        content: data.text
                    }
                });

                const message: ChatMessage = {
                    id: savedMsg.id,
                    senderId: socket.userId,
                    senderName: socket.userName || 'Unknown',
                    text: data.text,
                    timestamp: savedMsg.createdAt.toISOString(),
                };

                // Broadcast to others in room (not back to sender — sender adds optimistically)
                socket.to(roomId).emit("chat-message", message);
            } catch (err) {
                console.error("[Socket] Failed to save chat message", err);
            }
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

        // ─── Code Sync (Yjs CRDT pattern) ───
        socket.on("yjs-update", (data: { interviewId: string; update: Buffer }) => {
            const roomId = `interview-${data.interviewId}`;
            
            // Cache update
            const updates = roomYjsDocs.get(data.interviewId) || [];
            updates.push(data.update);
            roomYjsDocs.set(data.interviewId, updates);

            // Broadcast to others
            socket.to(roomId).emit("yjs-update", {
                update: data.update,
                userId: socket.userId
            });
        });

        // ─── Whiteboard Sync ───
        socket.on("whiteboard-sync", (data: { interviewId: string; elements: any[] }) => {
            const roomId = `interview-${data.interviewId}`;
            
            // Cache latest full state
            roomWhiteboards.set(data.interviewId, data.elements);

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

        // ─── Recording Timestamps ───
        socket.on("add-timestamp", async (data: { interviewId: string; type: string; label: string; offsetMs: number }, callback) => {
            try {
                const { interviewId, type, label, offsetMs } = data;
                const ts = await prisma.recordingTimestamp.create({
                    data: {
                        interviewId,
                        offsetMs,
                        type,
                        label,
                        createdBy: socket.userId ?? null,
                    },
                });
                const roomId = `interview-${interviewId}`;
                io.to(roomId).emit("timestamp-added", {
                    id: ts.id,
                    offsetMs: ts.offsetMs,
                    type: ts.type,
                    label: ts.label,
                });
                callback?.({ success: true, timestamp: ts });
            } catch (err: any) {
                console.error("[Socket] add-timestamp error:", err);
                callback?.({ error: err.message });
            }
        });

        // ─── Join Webinar Room ───
        socket.on("join-webinar", async (data: { webinarId: string }, callback) => {
            try {
                const { webinarId } = data;
                const roomId = `webinar-${webinarId}`;

                const webinar = await prisma.webinar.findUnique({
                    where: { id: webinarId },
                    include: {
                        company: { select: { userId: true, name: true } },
                        targetUniversities: { include: { university: true } }
                    }
                });

                if (!webinar) {
                    socket.emit("error", { message: "Webinar not found" });
                    return;
                }

                let role = "VIEWER";
                if (webinar.company.userId === socket.userId) {
                    role = "PRESENTER";
                } else if (socket.userRole === "STUDENT") {
                    const student = await prisma.student.findUnique({
                        where: { userId: socket.userId! },
                        include: { university: true }
                    });
                    if (!student || !webinar.targetUniversities.some(tu => tu.universityId === student.universityId)) {
                        socket.emit("error", { message: "Not authorized to join this webinar" });
                        return;
                    }
                } else if (socket.userRole === "UNIVERSITY") {
                    const university = await prisma.university.findUnique({
                        where: { userId: socket.userId! }
                    });
                    if (!university || !webinar.targetUniversities.some(tu => tu.universityId === university.id)) {
                        socket.emit("error", { message: "Not authorized to join this webinar" });
                        return;
                    }
                } else if (socket.userRole !== "COMPANY_ADMIN") {
                    socket.emit("error", { message: "Not authorized to join this webinar" });
                    return;
                }

                socket.join(roomId);
                socket.data.webinarRole = role;
                socket.data.webinarId = webinarId;

                // Record attendance in DB
                await prisma.webinarAttendee.upsert({
                    where: { webinarId_userId: { webinarId, userId: socket.userId! } },
                    create: { webinarId, userId: socket.userId!, role },
                    update: { leftAt: null, role }
                });

                // Notify room about new participant
                socket.to(roomId).emit("webinar-peer-joined", {
                    userId: socket.userId,
                    userName: socket.userName,
                    role
                });

                // Send current attendees to the joiner
                const attendees = await prisma.webinarAttendee.findMany({
                    where: { webinarId, leftAt: null },
                    orderBy: { joinedAt: 'asc' }
                });

                // Send existing producers for late joiner consumption
                const existingProducers = Array.from(producers.values())
                    .filter(p => p.appData.webinarId === webinarId && p.appData.userId !== socket.userId)
                    .map(p => ({ producerId: p.id, userId: p.appData.userId }));

                callback?.({
                    success: true,
                    role,
                    webinar: {
                        id: webinar.id,
                        title: webinar.title,
                        status: webinar.status,
                        companyName: webinar.company.name
                    },
                    attendees,
                    producers: existingProducers
                });

                console.log(`[Socket] ${socket.userName} joined webinar room ${roomId} as ${role}`);
            } catch (err) {
                console.error("[Socket] join-webinar error:", err);
                socket.emit("error", { message: "Failed to join webinar" });
            }
        });

        // ─── Raise Hand (Viewer) ───
        socket.on("raise-hand", (data: { webinarId: string }) => {
            const roomId = `webinar-${data.webinarId}`;
            socket.to(roomId).emit("hand-raised", {
                userId: socket.userId,
                userName: socket.userName
            });
        });

        // ─── Lower Hand (Viewer) ───
        socket.on("lower-hand", (data: { webinarId: string }) => {
            const roomId = `webinar-${data.webinarId}`;
            socket.to(roomId).emit("hand-lowered", {
                userId: socket.userId,
                userName: socket.userName
            });
        });

        // ─── Grant Permission (Presenter) ───
        socket.on("grant-permission", async (data: { webinarId: string, targetUserId: string }, callback) => {
            try {
                if (socket.data.webinarRole !== "PRESENTER") {
                    callback?.({ error: "Only presenter can grant permission" });
                    return;
                }

                await prisma.webinarAttendee.update({
                    where: {
                        webinarId_userId: {
                            webinarId: data.webinarId,
                            userId: data.targetUserId
                        }
                    },
                    data: { hasPermissionToSpeak: true }
                });

                const roomId = `webinar-${data.webinarId}`;
                io.to(roomId).emit("permission-granted", {
                    userId: data.targetUserId
                });

                callback?.({ success: true });
            } catch (err) {
                console.error("[Socket] grant-permission error:", err);
                callback?.({ error: "Failed to grant permission" });
            }
        });

        // ─── Revoke Permission (Presenter) ───
        socket.on("revoke-permission", async (data: { webinarId: string, targetUserId: string }, callback) => {
            try {
                if (socket.data.webinarRole !== "PRESENTER") {
                    callback?.({ error: "Only presenter can revoke permission" });
                    return;
                }

                await prisma.webinarAttendee.update({
                    where: {
                        webinarId_userId: {
                            webinarId: data.webinarId,
                            userId: data.targetUserId
                        }
                    },
                    data: { hasPermissionToSpeak: false }
                });

                // Kill any active producers from this viewer
                for (const [prodId, prod] of producers) {
                    if (prod.appData.webinarId === data.webinarId && prod.appData.userId === data.targetUserId) {
                        prod.close();
                        producers.delete(prodId);
                    }
                }

                const roomId = `webinar-${data.webinarId}`;
                io.to(roomId).emit("permission-revoked", {
                    userId: data.targetUserId
                });

                callback?.({ success: true });
            } catch (err) {
                console.error("[Socket] revoke-permission error:", err);
                callback?.({ error: "Failed to revoke permission" });
            }
        });

        // ─── End Webinar (Presenter) ───
        socket.on("end-webinar", async (data: { webinarId: string }, callback) => {
            try {
                if (socket.data.webinarRole !== "PRESENTER") {
                    callback?.({ error: "Only presenter can end the webinar" });
                    return;
                }

                await prisma.webinar.update({
                    where: { id: data.webinarId },
                    data: { status: "COMPLETED" }
                });

                // Close all producers for this webinar
                for (const [prodId, prod] of producers) {
                    if (prod.appData.webinarId === data.webinarId) {
                        prod.close();
                        producers.delete(prodId);
                    }
                }

                const roomId = `webinar-${data.webinarId}`;
                io.to(roomId).emit("webinar-ended", {
                    endedBy: socket.userName
                });

                callback?.({ success: true });
            } catch (err) {
                console.error("[Socket] end-webinar error:", err);
                callback?.({ error: "Failed to end webinar" });
            }
        });

        // ─── Webinar Chat Message ───
        socket.on("webinar-chat-message", async (data: { webinarId: string; text: string; isQuestion?: boolean }) => {
            if (!socket.userId || !data.webinarId || !data.text?.trim()) return;
            const roomId = `webinar-${data.webinarId}`;

            try {
                const savedMsg = await prisma.webinarMessage.create({
                    data: {
                        webinarId: data.webinarId,
                        senderId: socket.userId,
                        senderName: socket.userName || "Anonymous",
                        content: data.text,
                        isQuestion: data.isQuestion ?? false
                    }
                });

                io.to(roomId).emit("webinar-chat-message", {
                    id: savedMsg.id,
                    senderId: socket.userId,
                    senderName: socket.userName,
                    text: data.text,
                    isQuestion: savedMsg.isQuestion,
                    timestamp: savedMsg.createdAt.toISOString()
                });
            } catch (err) {
                console.error("[Socket] Failed to save webinar chat message", err);
            }
        });

        // ─── Produce for Webinar ───
        socket.on("produce-webinar", async (data: { webinarId: string; transportId: string; kind: any; rtpParameters: any }, callback) => {
            try {
                const transport = transports.get(data.transportId);
                if (!transport) throw new Error("Transport not found");

                const producer = await transport.produce({
                    kind: data.kind,
                    rtpParameters: data.rtpParameters
                });
                producer.appData.userId = socket.userId;
                producer.appData.webinarId = data.webinarId;
                producers.set(producer.id, producer);

                const roomId = `webinar-${data.webinarId}`;
                socket.to(roomId).emit("new-webinar-producer", {
                    producerId: producer.id,
                    userId: socket.userId
                });

                callback({ id: producer.id });
            } catch (err: any) {
                console.error("[Socket] produce-webinar error:", err);
                callback({ error: err.message });
            }
        });

        // ─── Consume Webinar Producer ───
        socket.on("consume-webinar", async (data: { webinarId: string; transportId: string; producerId: string; rtpCapabilities: any }, callback) => {
            try {
                const transport = transports.get(data.transportId);
                const router = await createRoomRouter(`webinar-${data.webinarId}`);

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

                consumer.on("transportclose", () => consumers.delete(consumer.id));
                consumer.on("producerclose", () => {
                    consumers.delete(consumer.id);
                    socket.emit("webinar-consumer-closed", { consumerId: consumer.id });
                });

                callback({
                    id: consumer.id,
                    producerId: data.producerId,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters
                });
            } catch (err: any) {
                console.error("[Socket] consume-webinar error:", err);
                callback({ error: err.message });
            }
        });

        // ─── Resume Webinar Consumer ───
        socket.on("resume-webinar-consumer", async (data: { consumerId: string }, callback) => {
            const consumer = consumers.get(data.consumerId);
            if (consumer) {
                await consumer.resume();
                callback?.({ success: true });
            }
        });

        // ─── Leave Webinar Room ───
        socket.on("leave-webinar", async (data: { webinarId: string }) => {
            try {
                const roomId = `webinar-${data.webinarId}`;
                socket.leave(roomId);

                await prisma.webinarAttendee.update({
                    where: {
                        webinarId_userId: {
                            webinarId: data.webinarId,
                            userId: socket.userId!
                        }
                    },
                    data: { leftAt: new Date() }
                });

                // Close any producers from this user in this webinar
                for (const [prodId, prod] of producers) {
                    if (prod.appData.webinarId === data.webinarId && prod.appData.userId === socket.userId) {
                        prod.close();
                        producers.delete(prodId);
                    }
                }

                socket.to(roomId).emit("webinar-peer-left", {
                    userId: socket.userId,
                    userName: socket.userName
                });

                console.log(`[Socket] ${socket.userName} left webinar room ${roomId}`);
            } catch (err) {
                console.error("[Socket] leave-webinar error:", err);
            }
        });

        // ─── Join Contest Live (Percentile Room) ───
        socket.on("join-contest-live", async (data: { contestId: string }) => {
            try {
                const { contestId } = data;
                if (!socket.userId) {
                    socket.emit("error", { message: "Not authenticated" });
                    return;
                }
                const user = await prisma.user.findUnique({
                    where: { id: socket.userId },
                    include: { studentProfile: { select: { id: true } } }
                });
                if (!user?.cnid || !user.studentProfile) {
                    socket.emit("error", { message: "Only students can join contest live" });
                    return;
                }

                const reg = await prisma.contestRegistration.findFirst({
                    where: { studentId: user.studentProfile.id, contestId }
                });
                if (!reg) {
                    socket.emit("error", { message: "Not registered for this contest" });
                    return;
                }

                const personalRoom = `contest-live:${contestId}:${user.cnid}`;
                socket.join(personalRoom);

                await percentileService.registerParticipant(contestId, user.cnid);
                const { percentile, totalParticipants } = await percentileService.computePercentile(contestId, user.cnid);

                socket.emit("percentile-update", {
                    percentile,
                    totalParticipants,
                    timestamp: Date.now(),
                });
            } catch (err) {
                console.error("[Socket] join-contest-live error:", err);
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
                } else if (room.startsWith("webinar-")) {
                    socket.to(room).emit("webinar-peer-left", {
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
