import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from '@/lib/email';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const id = url.searchParams.get('data.id') || url.searchParams.get('id');

    if (topic === 'payment' && id) {
      const paymentClient = new Payment(client);
      const paymentInfo = await paymentClient.get({ id: id });

      if (paymentInfo.status === 'approved') {
        const email = paymentInfo.external_reference;
        const tempPassword = 'Metodo123!';

        if (email) {
          const { error } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { must_change_password: true, plan_type: 'lifetime' },
          });

          if (error && error.message === 'User already registered') {
            console.log(`Usuario ${email} ya existe. Actualizando a plan lifetime...`);
            // Buscar al usuario por email para actualizarlo
            const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
            const existingUser = users.find(u => u.email === email);
            
            if (existingUser) {
              await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
                user_metadata: { ...existingUser.user_metadata, plan_type: 'lifetime' }
              });
              console.log(`✅ Plan de ${email} actualizado a lifetime`);
            }
          } else if (error) {
            console.error('Error creando usuario en Supabase:', error);
          } else {
            console.log(`✅ Cuenta creada para ${email} vía Mercado Pago (lifetime)`);
            // Enviar email de bienvenida solo si es nuevo
            await sendWelcomeEmail(email, tempPassword);
          }
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error en Webhook Mercado Pago:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
