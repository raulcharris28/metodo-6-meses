import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuración de R2
// forcePathStyle: true es REQUERIDO para Cloudflare R2
// Sin esto, el SDK de AWS antepone el bucket como subdominio (bucket.endpoint)
// generando URLs malformadas. R2 usa path-style: endpoint/bucket/archivo
const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});
const bucketName = process.env.R2_BUCKET_NAME!;

export async function POST(req: NextRequest) {
  try {
    // Verificar que el usuario esté logueado usando su token de sesión
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
    }

    const { files } = await req.json();
    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: 'Lista de archivos requerida' }, { status: 400 });
    }

    // Generar signed URLs para cada archivo usando Cloudflare R2
    const urls: Record<string, string> = {};
    for (const fileName of files) {
      try {
        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: fileName,
        });
        
        // El enlace expira en 1 hora (3600 segundos)
        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        urls[fileName] = signedUrl;
      } catch (err) {
        console.error(`Error generando URL para ${fileName}:`, err);
      }
    }

    return NextResponse.json({ urls });
  } catch (err) {
    console.error('Error generando signed URLs:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
