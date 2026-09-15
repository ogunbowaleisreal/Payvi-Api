import "dotenv/config";


import app from "./app.js";
import redisClient, { connectRedis } from "./config/redis.js";
import { env } from "./config/env.js";

const startServer = async () => {
    try {
        await connectRedis();

        const server = app.listen(env.PORT, () => {
            console.log(`Server running on port ${env.PORT}`);
        });

        const shutdown = async (signal: string) => {
            console.log(
                `${signal} received. Shutting down gracefully...`
            );

            server.close(async () => {
                try {
                    if (redisClient.isOpen) {
                        await redisClient.quit();
                    }

                    console.log("Server shut down successfully");
                    process.exit(0);
                } catch (error) {
                    console.error(
                        "Error during shutdown:",
                        error
                    );

                    process.exit(1);
                }
            });
        };

        process.on("SIGTERM", () => {
            void shutdown("SIGTERM");
        });

        process.on("SIGINT", () => {
            void shutdown("SIGINT");
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

void startServer();

