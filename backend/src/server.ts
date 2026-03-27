import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js"

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log("DATABASE CONNECTED");
        app.listen(env.PORT, () => {
            console.log("Server Running");
        })
    } catch (e) {
        console.log("failed to start server", e);
        await prisma.$disconnect();
        process.exit(1);
    }
}
startServer();