/**
 * Test different Supabase pooler regions
 */
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const regions = [
    'aws-0-ap-south-1',      // Mumbai
    'aws-0-ap-southeast-1',  // Singapore
    'aws-0-us-east-1',       // N. Virginia
    'aws-0-us-west-1',       // N. California
    'aws-0-eu-west-1',       // Ireland
    'aws-0-eu-central-1',    // Frankfurt
];

const password = process.env.DB_PASSWORD;
const projectRef = 'bymnwlroxxaothmmoldw';

async function testRegion(region) {
    const pool = new Pool({
        host: `${region}.pooler.supabase.com`,
        port: 5432,
        database: 'postgres',
        user: `postgres.${projectRef}`,
        password: password,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
    });

    try {
        const result = await pool.query('SELECT NOW()');
        console.log(`✓ ${region} - CONNECTED!`);
        await pool.end();
        return true;
    } catch (err) {
        console.log(`✗ ${region} - ${err.message}`);
        await pool.end();
        return false;
    }
}

async function findRegion() {
    console.log('Testing Supabase pooler regions...\n');
    console.log(`Project: ${projectRef}`);
    console.log(`Password: ${password ? '***' : 'NOT SET'}\n`);
    
    for (const region of regions) {
        const success = await testRegion(region);
        if (success) {
            console.log(`\n✓ Use this in .env:`);
            console.log(`DB_HOST=${region}.pooler.supabase.com`);
            console.log(`DB_USER=postgres.${projectRef}`);
            break;
        }
    }
}

findRegion().catch(console.error);
