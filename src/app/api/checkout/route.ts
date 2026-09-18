import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Inicializar Mercado Pago con el token configurado
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

export async function POST(req: Request) {
  try {
    const { email, plan } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    const isMonthly = plan === 'monthly';
    const priceCOP = isMonthly ? 80000 : 400000; // $20 USD = ~80k COP, $100 USD = ~400k COP
    const productTitle = isMonthly ? 'Suscripción 1 Mes - Método 6 Meses' : 'Acceso Total - Método 6 Meses';

    const preference = new Preference(client);

    // Crear la preferencia de pago
    const result = await preference.create({
      body: {
        items: [
          {
            id: isMonthly ? 'membresia-mensual' : 'membresia-6-meses',
            title: productTitle,
            description: 'Acceso a los audios y materiales',
            quantity: 1,
            unit_price: priceCOP,
            currency_id: 'COP',
          },
        ],
        payer: {
          email: email,
        },
        external_reference: email, // CLAVE: Aquí guardamos el email para saber a quién crearle la cuenta
        back_urls: {
          success: 'https://metodo6meses.com/login?success=true',
          failure: 'https://metodo6meses.com/',
          pending: 'https://metodo6meses.com/login?pending=true',
        },
        auto_return: 'approved',
      },
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (error) {
    console.error('Error creando preferencia Mercado Pago:', error);
    return NextResponse.json(
      { error: 'Error al procesar el pago' },
      { status: 500 }
    );
  }
}
