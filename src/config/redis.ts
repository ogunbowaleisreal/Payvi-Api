import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL as string,
});

redisClient.on("error", (error) => {
    console.error("Redis Client Error:", error);
});

export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log("Redis client connected")
    }
};

export default redisClient;