const { createClient } = require('@supabase/supabase-js');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Setup Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Setup R2
const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
const bucketName = process.env.R2_BUCKET_NAME;

async function uploadToR2(fileName, buffer, contentType) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: buffer,
    ContentType: contentType,
  });
  await s3.send(command);
}

async function migrateFiles() {
  console.log("Iniciando migración Supabase -> Cloudflare R2...");
  
  // List all files in Supabase bucket (with pagination if needed)
  let allFiles = [];
  let hasMore = true;
  let offset = 0;
  const limit = 100;
  
  while (hasMore) {
    const { data, error } = await supabase.storage
      .from('INGLES')
      .list('', { limit, offset, sortBy: { column: 'name', order: 'asc' } });
      
    if (error) {
      console.error("Error al listar archivos de Supabase:", error);
      process.exit(1);
    }
    
    if (data.length === 0) {
      hasMore = false;
    } else {
      allFiles.push(...data);
      offset += data.length;
      if (data.length < limit) hasMore = false;
    }
  }

  // Filter out the `.emptyFolderPlaceholder` or directories
  const filesToMigrate = allFiles.filter(f => f.metadata && f.id);
  
  console.log(`Encontrados ${filesToMigrate.length} archivos para migrar.`);
  
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < filesToMigrate.length; i++) {
    const file = filesToMigrate[i];
    console.log(`[${i+1}/${filesToMigrate.length}] Procesando: ${file.name}...`);
    
    try {
      // 1. Download from Supabase
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('INGLES')
        .download(file.name);
        
      if (downloadError) throw downloadError;
      
      const buffer = Buffer.from(await fileData.arrayBuffer());
      
      // 2. Upload to R2
      const ext = path.extname(file.name).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.mp3') contentType = 'audio/mpeg';
      if (ext === '.pdf') contentType = 'application/pdf';
      
      await uploadToR2(file.name, buffer, contentType);
      console.log(`  ✓ Subido a R2 exitosamente.`);
      successCount++;
    } catch (e) {
      console.error(`  x Error migrando ${file.name}:`, e);
      errorCount++;
    }
  }

  console.log("\n=== Resumen de Migración ===");
  console.log(`Total archivos: ${filesToMigrate.length}`);
  console.log(`Éxitos: ${successCount}`);
  console.log(`Errores: ${errorCount}`);
  console.log("============================");
}

migrateFiles();
