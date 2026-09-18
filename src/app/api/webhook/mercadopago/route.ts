import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

// Inicializamos cliente de Supabase con permisos de administrador (Service Role)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // Mercado Pago envía los datos en la query string (por ej: ?topic=payment&id=123456)
    // Opcionalmente los puede enviar en el body
    const url = new URL(req.url);
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const id = url.searchParams.get('data.id') || url.searchParams.get('id');

    if (topic === 'payment' && id) {
      // 1. Consultar el pago oficial en MP para evitar fraudes (Spoofing)
      const paymentClient = new Payment(client);
      const paymentInfo = await paymentClient.get({ id: id });

      // 2. Si fue aprobado y está pagado
      if (paymentInfo.status === 'approved') {
        const email = paymentInfo.external_reference;

        if (email) {
          // 3. Crear el usuario en Supabase
          const { error } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: 'Metodo123!',
            email_confirm: true, // Auto-confirmar el email
          });

          if (error && error.message !== 'User already registered') {
            console.error('Error creando usuario en Supabase:', error);
          } else {
            console.log(`✅ Cuenta creada para ${email} vía Mercado Pago`);
          }
        }
      }
    }

    // Siempre retornar 200 OK rápido para que Mercado Pago no reintente enviar el webhook
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error en Webhook Mercado Pago:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
