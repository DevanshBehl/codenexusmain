import { createServer } from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { createSocketServer } from "./socket/socket.js";
import { createWorkers } from "./lib/mediasoup.js";
import { initSubmissionWorker } from "./modules/codearena/submissionQueue.js";
import { startContestStatusJob } from "./jobs/contestStatus.job.js";

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log("DATABASE CONNECTED");
        const httpServer = createServer(app);
        
        // Initialize Mediasoup
        await createWorkers();

        // Initialize Background Workers
        initSubmissionWorker();

        // Start Contest Status Auto-Flip Job
        startContestStatusJob();

        // Attach Socket.IO
        createSocketServer(httpServer);
        
        httpServer.listen(Number(env.PORT), '0.0.0.0', () => {
            console.log(`Server Running on 0.0.0.0:${env.PORT}`);
        });
    } catch (e) {
        console.log("failed to start server", e);
        await prisma.$disconnect();
        process.exit(1);
    }
}
startServer();