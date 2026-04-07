import { createServer } from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { createSocketServer } from "./socket/socket.js";
import { createWorkers } from "./lib/mediasoup.js";

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log("DATABASE CONNECTED");
        const httpServer = createServer(app);
        
        // Initialize Mediasoup
        await createWorkers();

        // Attach Socket.IO
        createSocketServer(httpServer);
        
        httpServer.listen(env.PORT, () => {
            console.log(`Server Running on port ${env.PORT}`);
        });
    } catch (e) {
        console.log("failed to start server", e);
        await prisma.$disconnect();
        process.exit(1);
    }
}
startServer();