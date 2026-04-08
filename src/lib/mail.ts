import nodemailer from "nodemailer";

interface SendVerificationEmailOptions {
  to: string;
  token: string;
  name?: string | null;
}

export async function sendVerificationEmail({ to, token, name }: SendVerificationEmailOptions) {
  // Configuración para el Stalwart Mail o servidor SMTP genérico
  // Estas variables deben ir en el archivo .env principal
  const smtpHost = process.env.SMTP_HOST || "";
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER || "";
  const smtpPass = process.env.SMTP_PASS || "";
  const fromEmail = process.env.SMTP_FROM || smtpUser;

  const appUrl = process.env.NEXTAUTH_URL || "https://cloud.otisperu.com";

  if (!smtpHost || !smtpUser) {
    console.warn("⚠️ Advertencia: No hay configuración SMTP proporcionada. El correo de validación no se enviará de forma real.");
    console.log(`[SIMULACIÓN SMTP] Enlace generado: ${appUrl}/verify-email?token=${token}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, 
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const verifyLink = `${appUrl}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"SmartCloudOPS" <${fromEmail}>`,
    to: to,
    subject: "Verifica tu cuenta en SmartCloudOPS",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #3b82f6;">¡Bienvenido a SmartCloudOPS${name ? `, ${name}` : ''}!</h2>
        <p>Gracias por registrarte en nuestra plataforma. Para poder continuar y provisionar instancias, primero debemos asegurar que eres el dueño de este correo.</p>
        <p>Por favor, haz clic en el siguiente enlace para verificar tu cuenta:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Verificar Mi Correo
          </a>
        </div>
        
        <p style="font-size: 13px; color: #64748b;">O puedes copiar y pegar este enlace en tu navegador de forma segura:</p>
        <p style="font-size: 13px; color: #64748b; word-break: break-all;">${verifyLink}</p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 40px;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">SmartCloudOPS — Infrastructure as a Service</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
