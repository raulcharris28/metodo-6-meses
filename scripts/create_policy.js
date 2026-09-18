const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Extract project ref from URL: https://XXXXX.supabase.co
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

async function main() {
  console.log("Proyecto:", projectRef);
  
  // Use Supabase Management API to run SQL
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' 
            AND tablename = 'objects' 
            AND policyname = 'Usuarios autenticados pueden leer INGLES'
          ) THEN
            CREATE POLICY "Usuarios autenticados pueden leer INGLES"
            ON storage.objects
            FOR SELECT
            TO authenticated
            USING (bucket_id = 'INGLES');
          END IF;
        END
        $$;
      `
    })
  });
  
  console.log("Status:", response.status);
  const text = await response.text();
  console.log("Response:", text);
}

main();
