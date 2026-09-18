import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? '';

// Helper: verify the calling user is the admin
async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '');

  // Use anon client to verify the token
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user } } = await anonClient.auth.getUser(token);
  return user?.email === ADMIN_EMAIL;
}

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Admin client with service role key
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // List all users from Supabase Auth
  const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  // Get all progress records
  const { data: progreso } = await adminClient.from('progreso').select('user_id, clase_id');

  // Group progress by user_id
  const progresoMap: Record<string, number> = {};
  if (progreso) {
    for (const row of progreso as { user_id: string; clase_id: number }[]) {
      progresoMap[row.user_id] = (progresoMap[row.user_id] ?? 0) + 1;
    }
  }

  const result = users.map(u => ({
    id: u.id,
    email: u.email ?? '',
    created_at: u.created_at,
    clases_completadas: progresoMap[u.id] ?? 0,
    porcentaje: Math.round(((progresoMap[u.id] ?? 0) / 195) * 100),
  }));

  // Sort by most progress first
  result.sort((a, b) => b.clases_completadas - a.clases_completadas);

  return NextResponse.json({ users: result });
}
