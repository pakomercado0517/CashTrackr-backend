import { transport } from '../config/nodemailer';
const { FRONTEND_URL } = process.env;

type EmailType = {
  name: string;
  email: string;
  token: string;
};

export class AuthEmail {
  static sendConfirmationEmail = async (user: EmailType) => {
    const email = await transport.sendMail({
      from: 'CashTrackr <admin@cashtrackr.com>',
      to: user.email,
      subject: 'CashTrackr - Confirma tu cuenta',
      html: `
      <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Cuenta - CashTrackr</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            background: #007bff;
            color: #ffffff;
            padding: 15px;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #555;
            padding: 15px;
            border-top: 1px solid #ddd;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 10px;
            text-decoration: none;
            background: #007bff;
            color: #ffffff;
            border-radius: 5px;
            font-weight: bold;
        }
        .button:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>

    <div class="container">
        <div class="header">
            <h2>Confirma tu Cuenta en CashTrackr</h2>
        </div>
        <div class="content">
            <p>Hola <strong>${user.name}</strong>,</p>
            <p>Gracias por registrarte en <strong>CashTrackr</strong>. Para completar tu registro, haz clic en el siguiente botón:</p>
            <a href="${FRONTEND_URL}/auth/confirm_acount" class="button">Confirmar Cuenta</a>
            <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
            <p>${FRONTEND_URL}/auth/confirm-acount</p>
            <p>También puedes ingresar el siguiente código de verificación:</p>
            <h3 style="color: #007bff;">${user.token}</h3>
        </div>
        <div class="footer">
            <p>Este es un mensaje automático, por favor no respondas.</p>
            <p>&copy; 2025 CashTrackr - Todos los derechos reservados.</p>
        </div>
    </div>

</body>
</html>
      `,
    });
    console.log('email enviado con éxito', email.messageId);
  };

  static sendPasswordResetToken = async (user: EmailType) => {
    const email = await transport.sendMail({
      from: 'CashTrackr <admin@cashtrackr.com>',
      to: user.email,
      subject: 'CashTrackr - Reestablece tu Password',
      html: `
      <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer Contraseña - CashTrackr</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            background: #dc3545;
            color: #ffffff;
            padding: 15px;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #555;
            padding: 15px;
            border-top: 1px solid #ddd;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 10px;
            text-decoration: none;
            background: #dc3545;
            color: #ffffff;
            border-radius: 5px;
            font-weight: bold;
        }
        .button a {
        text-decoration: none;
        color: #ffffff;
        }
        .button:hover {
            background: #bb2d3b;
        }
    </style>
</head>
<body>

    <div class="container">
        <div class="header">
            <h2>Restablecer tu Contraseña</h2>
        </div>
        <div class="content">
            <p>Hola <strong>${user.name}</strong>,</p>
            <p>Has solicitado restablecer tu contraseña en <strong>CashTrackr</strong>.</p>
            <p>Para continuar, haz clic en el siguiente botón:</p>
            <a href=${FRONTEND_URL}/auth/new-password class="button">Restablecer Contraseña</a>
            <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
            <p>${FRONTEND_URL}/auth/new-password</p>
            <p>También puedes usar el siguiente código de verificación:</p>
            <h3 style="color: #dc3545;">${user.token}</h3>
        </div>
        <div class="footer">
            <p>Si no solicitaste este cambio, ignora este correo.</p>
            <p>&copy; 2025 CashTrackr - Todos los derechos reservados.</p>
        </div>
    </div>

</body>
</html>
      `,
    });
    console.log('email enviado con éxito', email.messageId);
  };
}
