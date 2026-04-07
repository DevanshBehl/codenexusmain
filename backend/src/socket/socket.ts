import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { createRoomRouter, createWebRtcTransport, transports, producers, consumers, routers } from "../lib/mediasoup.js";

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
                producers.set(producer.id, producer);

                const roomId = `interview-${data.interviewId}`;
                socket.to(roomId).emit("new-producer", { producerId: producer.id, userId: socket.userId });

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
             // In a real app we would map interviewId -> router -> producers.
             const producerList = Array.from(producers.values())
                 .filter(p => p.appData.userId !== socket.userId)
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
            } catch (err) {
                console.error("[Socket] end-interview error:", err);
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

    return io;
}
