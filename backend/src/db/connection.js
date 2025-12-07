/**
 * Database Connection Pool
 * Manages PostgreSQL connections for the application
 */

const { Pool } = require('pg');
require('dotenv').config();

// Determine if we need SSL (for cloud databases like Supabase)
const isProduction = process.env.NODE_ENV === 'production';
const isCloudDB = process.env.DB_HOST && !process.env.DB_HOST.includes('localhost');

// Create connection pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'truestate_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20, // Maximum number of clients in pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 10000, // Return error after 10 seconds if connection not established
    // Enable SSL for cloud databases (Supabase, etc.)
    ssl: isCloudDB ? { rejectUnauthorized: false } : false,
});

// Test connection on startup
pool.on('connect', () => {
    console.log('Database connection established');
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

/**
 * Execute a query
 * @param {string} text - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise} Query result
 */
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        
        // Log slow queries (> 100ms)
        if (duration > 100) {
            console.log('Slow query executed', { text, duration, rows: res.rowCount });
        }
        
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise} Database client
 */
const getClient = async () => {
    const client = await pool.connect();
    
    // Add query method to client
    const originalQuery = client.query;
    client.query = (...args) => {
        const start = Date.now();
        return originalQuery.apply(client, args).then(res => {
            const duration = Date.now() - start;
            if (duration > 100) {
                console.log('Slow query executed', { duration, rows: res.rowCount });
            }
            return res;
        });
    };
    
    return client;
};

/**
 * Close all connections
 */
const closePool = async () => {
    await pool.end();
    console.log('Database pool closed');
};

// Graceful shutdown
process.on('SIGINT', async () => {
    await closePool();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await closePool();
    process.exit(0);
});

module.exports = {
    query,
    getClient,
    closePool,
    pool
};
