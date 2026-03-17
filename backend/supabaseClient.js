/* ============================================================
   STUDYVERSE — Supabase Connection (supabaseClient.js)
   ============================================================
   This file creates the connection to our Supabase database.
   Think of it as opening the door to our database.
   
   We export the "supabase" object so other files can use it
   to read/write data from the database.
   ============================================================ */

// Load environment variables from .env file
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Read our Supabase credentials from .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Safety check: crash early if credentials are missing
if (!supabaseUrl || !supabaseKey) {
    console.error('ERROR: Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env file!');
    process.exit(1);
}

// Create the Supabase client (our connection to the database)
const supabase = createClient(supabaseUrl, supabaseKey);

// Export so other files can use it: const supabase = require('./supabaseClient');
module.exports = supabase;
