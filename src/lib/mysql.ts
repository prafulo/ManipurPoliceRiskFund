import mysql from 'mysql2/promise';

// This is a simplified connection pool. In a real production app,
// you might want to handle connection closing and re-opening more robustly.
let pool: mysql.Pool | null = null;

function getPool() {
    if (pool) {
        return pool;
    }
    
    // Check if the environment variables are set.
    // Next.js automatically loads variables from .env.local, so dotenv is not needed here for the app runtime.
    if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD || !process.env.MYSQL_DB) {
        throw new Error('MySQL environment variables are not set.');
    }

    pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DB,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    return pool;
}

export async function query(sql: string, params: any[]) {
    const pool = getPool();
    const [results] = await pool.execute(sql, params);
    return results;
}
