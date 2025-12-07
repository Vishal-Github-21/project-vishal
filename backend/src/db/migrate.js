/**
 * Database Migration Script
 * Loads CSV data into PostgreSQL database
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Pool } = require('pg');

// Load .env from backend directory (works when script is run from anywhere)
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Determine if we need SSL (for cloud databases like Supabase)
const isCloudDB = process.env.DB_HOST && !process.env.DB_HOST.includes('localhost');

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'truestate_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000, // Increased for cloud DB
    // Enable SSL for cloud databases (Supabase, etc.)
    ssl: isCloudDB ? { rejectUnauthorized: false } : false,
});

/**
 * Run schema migration
 */
async function runSchema() {
    const client = await pool.connect();
    try {
        console.log('Running schema migration...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);
        console.log('✓ Schema created successfully');
    } catch (error) {
        console.error('Error running schema:', error);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Import CSV data in batches
 */
async function importCsvData() {
    const csvPath = path.join(__dirname, '../../data/truestate_assignment_dataset.csv');
    
    return new Promise((resolve, reject) => {
        const records = [];
        let batchCount = 0;
        const BATCH_SIZE = 5000; // Insert 5000 records at a time
        let totalInserted = 0;

        console.log('Starting CSV import...');
        console.log(`Reading from: ${csvPath}`);

        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (row) => {
                // Transform CSV row to match database schema
                records.push({
                    transaction_id: row['Transaction ID'],
                    date: row['Date'],
                    customer_id: row['Customer ID'],
                    customer_name: row['Customer Name'],
                    phone_number: row['Phone Number'],
                    gender: row['Gender'],
                    age: parseInt(row['Age']) || null,
                    customer_region: row['Customer Region'],
                    customer_type: row['Customer Type'],
                    product_id: row['Product ID'],
                    product_name: row['Product Name'],
                    brand: row['Brand'],
                    product_category: row['Product Category'],
                    tags: row['Tags'],
                    quantity: parseInt(row['Quantity']) || null,
                    price_per_unit: parseFloat(row['Price per Unit']) || null,
                    discount_percentage: parseFloat(row['Discount Percentage']) || null,
                    total_amount: parseFloat(row['Total Amount']) || null,
                    final_amount: parseFloat(row['Final Amount']) || null,
                    payment_method: row['Payment Method'],
                    order_status: row['Order Status'],
                    delivery_type: row['Delivery Type'],
                    store_id: row['Store ID'],
                    store_location: row['Store Location'],
                    salesperson_id: row['Salesperson ID'],
                    employee_name: row['Employee Name']
                });

                // Insert batch when BATCH_SIZE is reached
                if (records.length >= BATCH_SIZE) {
                    batchCount++;
                    insertBatch(records.splice(0, BATCH_SIZE), batchCount)
                        .then(count => {
                            totalInserted += count;
                            process.stdout.write(`\rImported: ${totalInserted} records`);
                        })
                        .catch(err => {
                            console.error('\nError inserting batch:', err);
                        });
                }
            })
            .on('end', async () => {
                // Insert remaining records
                if (records.length > 0) {
                    batchCount++;
                    const count = await insertBatch(records, batchCount);
                    totalInserted += count;
                }
                
                console.log(`\n✓ CSV import completed. Total records: ${totalInserted}`);
                resolve(totalInserted);
            })
            .on('error', (error) => {
                console.error('Error reading CSV:', error);
                reject(error);
            });
    });
}

/**
 * Insert a batch of records
 */
async function insertBatch(records, batchNum) {
    const client = await pool.connect();
    try {
        // Build multi-row INSERT statement
        const values = [];
        const placeholders = [];
        
        records.forEach((record, idx) => {
            const offset = idx * 26; // 26 columns per record
            placeholders.push(
                `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, 
                  $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10},
                  $${offset + 11}, $${offset + 12}, $${offset + 13}, $${offset + 14}, $${offset + 15},
                  $${offset + 16}, $${offset + 17}, $${offset + 18}, $${offset + 19}, $${offset + 20},
                  $${offset + 21}, $${offset + 22}, $${offset + 23}, $${offset + 24}, $${offset + 25}, $${offset + 26})`
            );
            
            values.push(
                record.transaction_id,
                record.date,
                record.customer_id,
                record.customer_name,
                record.phone_number,
                record.gender,
                record.age,
                record.customer_region,
                record.customer_type,
                record.product_id,
                record.product_name,
                record.brand,
                record.product_category,
                record.tags,
                record.quantity,
                record.price_per_unit,
                record.discount_percentage,
                record.total_amount,
                record.final_amount,
                record.payment_method,
                record.order_status,
                record.delivery_type,
                record.store_id,
                record.store_location,
                record.salesperson_id,
                record.employee_name
            );
        });

        const insertQuery = `
            INSERT INTO sales_transactions (
                transaction_id, date, customer_id, customer_name, phone_number,
                gender, age, customer_region, customer_type, product_id,
                product_name, brand, product_category, tags, quantity,
                price_per_unit, discount_percentage, total_amount, final_amount,
                payment_method, order_status, delivery_type, store_id, store_location,
                salesperson_id, employee_name
            ) VALUES ${placeholders.join(', ')}
            ON CONFLICT (transaction_id) DO NOTHING
        `;

        await client.query(insertQuery, values);
        return records.length;
    } catch (error) {
        console.error(`Error in batch ${batchNum}:`, error.message);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Verify migration
 */
async function verifyMigration() {
    const client = await pool.connect();
    try {
        console.log('\nVerifying migration...');
        
        // Count total records
        const countResult = await client.query('SELECT COUNT(*) FROM sales_transactions');
        console.log(`✓ Total records in database: ${countResult.rows[0].count}`);
        
        // Sample query
        const sampleResult = await client.query('SELECT * FROM sales_transactions LIMIT 5');
        console.log(`✓ Sample records retrieved: ${sampleResult.rows.length}`);
        
        // Check indexes
        const indexResult = await client.query(`
            SELECT indexname, indexdef 
            FROM pg_indexes 
            WHERE tablename = 'sales_transactions'
        `);
        console.log(`✓ Indexes created: ${indexResult.rows.length}`);
        
        return true;
    } catch (error) {
        console.error('Verification failed:', error);
        return false;
    } finally {
        client.release();
    }
}

/**
 * Main migration function
 */
async function migrate() {
    const startTime = Date.now();
    
    try {
        console.log('=== TruEstate Database Migration ===\n');
        
        // Test connection
        console.log('Testing database connection...');
        await pool.query('SELECT NOW()');
        console.log('✓ Database connection successful\n');
        
        // Run schema
        await runSchema();
        
        // Import data
        await importCsvData();
        
        // Verify
        await verifyMigration();
        
        const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
        console.log(`\n✓ Migration completed successfully in ${duration} minutes`);
        
    } catch (error) {
        console.error('\n✗ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run migration if called directly
if (require.main === module) {
    migrate();
}

module.exports = { migrate, runSchema, importCsvData, verifyMigration };
