/**
 * Supabase Client Configuration
 * Simple connection using Supabase JS Client
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load .env from backend directory
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    console.error('Required: SUPABASE_URL and SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
