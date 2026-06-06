const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;
let useMockDb = false;

// Check if credentials are placeholders
if (
  !supabaseUrl || 
  !supabaseServiceKey || 
  supabaseUrl.includes('your-project-id') || 
  supabaseServiceKey.includes('your_supabase_service_role_key_here')
) {
  console.warn('⚠️ Warning: Using mock database. Configure your real Supabase credentials in backend/.env to connect to live database.');
  useMockDb = true;
  process.env.USE_MOCK_DB = 'true';
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch (err) {
    console.warn('⚠️ Warning: Failed to initialize Supabase client. Defaulting to local mock mode.', err.message);
    useMockDb = true;
    process.env.USE_MOCK_DB = 'true';
  }
}

module.exports = supabase;
