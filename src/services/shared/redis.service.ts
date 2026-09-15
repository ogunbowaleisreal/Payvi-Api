import redisClient from "../../config/redis.js";

export class RedisService {
    async set(key: string, value: string): Promise<void> {
        await redisClient.set(key, value);
    }

    async get(key: string): Promise<string | null> {
        return redisClient.get(key);
    }

    async delete(key: string): Promise<void> {
        await redisClient.del(key);
    }


    async increment(key: string): Promise<number> {
        return redisClient.incr(key);
    }

    async incrementWithExpiry(
        key: string,
        expiryInSeconds: number
    ): Promise<number> {
        const result = await redisClient
            .multi()
            .incr(key)
            .expire(key, expiryInSeconds, "NX")
            .exec();

        const count = result[0];

        if (typeof count !== "number") {
            throw new Error("Unexpected Redis INCR response");
        }

        return count;
    }


    async setWithExpiry(
        key: string,
        value: string,
        expiryInSeconds: number
    ): Promise<void> {
        await redisClient.set(key, value, {
            EX: expiryInSeconds,
        });
    }

    async exists(key: string): Promise<boolean> {
        return (await redisClient.exists(key)) === 1;
    }
}