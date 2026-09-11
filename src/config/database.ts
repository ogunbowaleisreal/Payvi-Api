import { Pool, type PoolConfig } from "pg";

const poolConfig: PoolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
};

const pool = new Pool(poolConfig);
pool.query("SELECT NOW()")
    .then((result) => {
        console.log("PostgreSQL connected:", result.rows[0]);
    })
    .catch((error: Error) => {
        console.error("PostgreSQL connection failed:", error.message);
    });

pool.on("error", (err: Error) => {
    console.error("Unexpected error on idle PostgreSQL client", err);
});

export default pool;