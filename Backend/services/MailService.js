import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

class MailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            secure: true, // true porque usas puerto 465
            auth: {
                user: process.env.MAIL_USERNAME, // debe ser exactamente "noreply@agustinmeza.dev"
                pass: process.env.MAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    async enviarCorreo(destinatario, asunto, contenidoHTML, contenidoTexto = null) {
        try {
            const mailOptions = {
                from: {
                    name: process.env.MAIL_FROM_NAME || 'Control de Asistencia',
                    address: process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME
                },
                to: destinatario,
                subject: asunto,
                html: contenidoHTML,
                text: contenidoTexto || this.htmlToText(contenidoHTML)
            };

            const info = this.transporter.sendMail(mailOptions);
            
            return {
                success: true,
                message: 'Correo enviado exitosamente',
                messageId: info.messageId
            };

        } catch (error) {
            console.error('Error al enviar correo:', error);
            return {
                success: false,
                message: 'Error al enviar el correo',
                error: error.message
            };
        }
    }

    async enviarCorreoRecuperacion(email, token, nombreUsuario) {
        const asunto = 'Recuperación de Contraseña - Control de Asistencia';
        const enlaceRecuperacion = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        
        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Recuperación de Contraseña</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Recuperación de Contraseña</h1>
                    </div>
                    <div class="content">
                        <h2>Hola ${nombreUsuario},</h2>
                        <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en el Sistema de Control de Asistencia.</p>
                        <p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
                        <a href="${enlaceRecuperacion}" class="button">Restablecer Contraseña</a>
                        <p>Este enlace expirará en 1 hora por seguridad.</p>
                        <p>Si no solicitaste este cambio, puedes ignorar este correo electrónico.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Sistema de Control de Asistencia. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.enviarCorreo(email, asunto, contenidoHTML);
    }

    async enviarCorreoBienvenida(email, nombreUsuario, passwordTemporal) {
        const asunto = 'Bienvenido al Sistema de Control de Asistencia';
        
        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Bienvenido</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .credentials { background-color: #e8f5e8; padding: 15px; border-radius: 4px; margin: 20px 0; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>¡Bienvenido!</h1>
                    </div>
                    <div class="content">
                        <h2>Hola ${nombreUsuario},</h2>
                        <p>Tu cuenta en el Sistema de Control de Asistencia ha sido creada exitosamente.</p>
                        <div class="credentials">
                            <h3>Credenciales de acceso:</h3>
                            <p><strong>Usuario:</strong> ${email}</p>
                            <p><strong>Contraseña temporal:</strong> ${passwordTemporal}</p>
                        </div>
                        <p><strong>Importante:</strong> Por seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.</p>
                        <a href="${process.env.FRONTEND_URL}/login" class="button">Iniciar Sesión</a>
                    </div>
                    <div class="footer">
                        <p>© 2025 Sistema de Control de Asistencia. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.enviarCorreo(email, asunto, contenidoHTML);
    }


    
    async enviarNotificacionMarcacion(email, nombreUsuario, tipoMarcacion, fecha, hora) {
        /** 
        @params {string} email - El correo electrónico del usuario
        @params {string} nombreUsuario - El nombre del usuario
        @params {string} tipoMarcacion - El tipo de marcación (entrada/salida)
        @params {string} fecha - La fecha de la marcación
        @params {string} hora - La hora de la marcación
        */


        const asunto = `Marcación de ${tipoMarcacion} registrada`;
        
        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Marcación Registrada</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .marcacion-info { background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #FF9800; }
                    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Marcación Registrada</h1>
                    </div>
                    <div class="content">
                        <h2>Hola ${nombreUsuario},</h2>
                        <p>Se ha registrado una nueva marcación en tu cuenta:</p>
                        <div class="marcacion-info">
                            <h3>Detalles de la marcación:</h3>
                            <p><strong>Tipo:</strong> ${tipoMarcacion.toUpperCase()}</p>
                            <p><strong>Fecha:</strong> ${fecha}</p>
                            <p><strong>Hora:</strong> ${hora}</p>
                        </div>
                        <p>Si no fuiste tú quien realizó esta marcación, contacta inmediatamente con el administrador.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Sistema de Control de Asistencia. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.enviarCorreo(email, asunto, contenidoHTML);
    }

    // Método auxiliar para convertir HTML a texto plano
    htmlToText(html) {
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .trim();
    }

    // Verificar conexión
    async verificarConexion() {
        try {
            await this.transporter.verify();
            return {
                success: true,
                message: 'Configuración de correo válida'
            };
        } catch (error) {
            console.error('Error en configuración de correo:', error);
            return {
                success: false,
                message: 'Error en configuración de correo',
                error: error.message
            };
        }
    }
}

export default new MailService();