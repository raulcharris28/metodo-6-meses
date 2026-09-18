import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from '@/lib/email';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    const tempPassword = 'Metodo123!';
    const trialStartDate = new Date().toISOString();

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { 
        must_change_password: true,
        plan_type: 'trial',
        trial_start_date: trialStartDate
      },
    });

    if (error) {
      if (error.message === 'User already registered') {
        return NextResponse.json({ error: 'Este correo ya está registrado.' }, { status: 400 });
      }
      console.error('Error creando usuario de prueba:', error);
      return NextResponse.json({ error: 'Error al crear la cuenta.' }, { status: 500 });
    }

    // Send welcome email
    await sendWelcomeEmail(email, tempPassword);

    return NextResponse.json({ success: true, message: 'Prueba iniciada. Revisa tu correo.' }, { status: 200 });
  } catch (error) {
    console.error('Error en API de prueba:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
