import { Resend } from 'resend';

export async function sendWelcomeEmail(email: string, password: string) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Método 6 Meses <onboarding@resend.dev>',
      to: email,
      subject: '🎉 ¡Bienvenido al Método 6 Meses! Tu acceso está listo',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#7c3aed,#0ea5e9);padding:40px;text-align:center;">
                    <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;">Método 6 Meses</h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Aprende inglés escuchando · 30 minutos al día</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px;">
                    <h2 style="color:#f1f5f9;font-size:22px;margin:0 0 16px;">¡Tu acceso está listo! 🎉</h2>
                    <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 28px;">
                      Tu compra fue procesada exitosamente. Tienes acceso a los <strong style="color:#e2e8f0;">195 audios y materiales</strong> del método:
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:12px;border:1px solid rgba(255,255,255,0.08);margin-bottom:28px;">
                      <tr><td style="padding:24px;">
                        <p style="margin:0 0 12px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Tus credenciales</p>
                        <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;">Correo: <strong style="color:#e2e8f0;">${email}</strong></p>
                        <p style="margin:0;color:#94a3b8;font-size:13px;">Contraseña temporal: <strong style="color:#38bdf8;font-family:monospace;font-size:15px;">${password}</strong></p>
                      </td></tr>
                    </table>
                    <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0 0 28px;">
                      ⚠️ Al iniciar sesión por primera vez, el sistema te pedirá que <strong style="color:#fbbf24;">elijas una contraseña personal</strong> segura.
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr><td align="center">
                        <a href="https://metodo6meses.com/login" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#0ea5e9);color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:700;">
                          Acceder a mi plataforma →
                        </a>
                      </td></tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 40px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(14,165,233,0.06);border-radius:12px;border:1px solid rgba(14,165,233,0.15);">
                      <tr><td style="padding:24px;">
                        <p style="margin:0 0 8px;color:#38bdf8;font-size:13px;font-weight:700;">💡 Consejo para empezar</p>
                        <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.7;">Dedica <strong style="color:#e2e8f0;">30 minutos cada día</strong> en el mismo horario. La constancia es la clave del método. ¡Tú puedes!</p>
                      </td></tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
                    <p style="margin:0 0 4px;color:#475569;font-size:12px;">Con amor y dedicación,</p>
                    <p style="margin:0;color:#818cf8;font-size:14px;font-weight:700;">Oba Abi Aye</p>
                    <p style="margin:8px 0 0;color:#334155;font-size:11px;">© 2026 metodo6meses.com</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });
    console.log(`✅ Email de bienvenida enviado a ${email}`);
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error);
  }
}
