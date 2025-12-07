const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const salesRoutes = require('./routes/salesRoutes');
const { loadData } = require('./utils/dataProcessor');

const app = express();
const PORT = process.env.PORT || 5001;
const USE_DATABASE = process.env.USE_DATABASE === 'true';

// CORS configuration for production
const corsOptions = {
    origin: process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(',') 
        : [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3000',
        ],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/sales', salesRoutes);

// Health check
app.get('/', (req, res) => {
    const dataSource = USE_DATABASE ? 'Supabase Database' : 'CSV File';
    res.json({ 
        message: 'API is running...',
        dataSource,
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        if (USE_DATABASE) {
            // Test Supabase connection
            const { supabase } = require('./db/supabase');
            const { count, error } = await supabase
                .from('sales_transactions')
                .select('*', { count: 'exact', head: true });
            
            if (error) throw error;
            
            res.json({
                status: 'healthy',
                dataSource: 'supabase',
                recordCount: count || 0,
                timestamp: new Date().toISOString()
            });
        } else {
            const { getSalesData } = require('./utils/dataProcessor');
            const data = getSalesData();
            res.json({
                status: 'healthy',
                dataSource: 'csv',
                recordCount: data.length,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

// Start server
const startServer = async () => {
    try {
        if (USE_DATABASE) {
            console.log('🔄 Using Supabase database mode');
            // Test Supabase connection
            const { supabase } = require('./db/supabase');
            const { error } = await supabase.from('sales_transactions').select('id').limit(1);
            if (error) {
                console.log('⚠️  Supabase table not found or empty - create table first!');
                console.log('   Run the SQL from: src/db/supabase-schema.sql');
            } else {
                console.log('✓ Supabase connection established');
            }
        } else {
            console.log('🔄 Using CSV file mode');
            await loadData();
        }
        
        const server = app.listen(PORT, () => {
            console.log(`✓ Server running on port ${PORT}`);
            console.log(`  Data source: ${USE_DATABASE ? 'Supabase' : 'CSV File'}`);
            console.log(`  Health check: http://localhost:${PORT}/api/health`);
            console.log(`  API endpoint: http://localhost:${PORT}/api/sales`);
        });

        // Force keep-alive for the event loop
        setInterval(() => {
            // Heartbeat to keep process active
        }, 60000);

    } catch (error) {
        console.error('✗ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
