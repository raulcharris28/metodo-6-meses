import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Este endpoint usa la SERVICE ROLE KEY (solo en el servidor)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Generar signed URLs para cada archivo con el service role (servidor seguro)
    const urls: Record<string, string> = {};
    for (const fileName of files) {
      const { data, error } = await supabaseAdmin.storage
        .from('INGLES')
        .createSignedUrl(fileName, 3600); // 1 hora
      
      if (!error && data) {
        urls[fileName] = data.signedUrl;
      }
    }

    return NextResponse.json({ urls });
  } catch (err) {
    console.error('Error generando signed URLs:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
