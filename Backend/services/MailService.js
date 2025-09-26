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


    
    async enviarNotificacionMarcacion(usuario, marcacion, empresa, lugar, domicilio_prestacion) {
        /**
        @params {object} usuario - Objeto con los datos del usuario
        @params {object} marcacion - Objeto con los datos de la marcación
        @params {object} empresa - Objeto con los datos de la empresa
        @params {object} lugar - Objeto con los datos del lugar (puede ser null)
        @params {string|null} domicilio_prestacion - Dirección de prestación (puede ser null)
        */

        // Formatear RUT empresa con puntos y guion
        const rutEmpresaFormateado = empresa.emp_rut
            ? empresa.emp_rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '-' + empresa.emp_rut.slice(-1)
            : '';

        // Si lugar no es null, armar el bloque HTML
        let lugarHTML = '';
        if (lugar) {
            lugarHTML = `
                <div class="lugar-info" style="background-color: #fffde7; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #FFEB3B;">
                    <h3>Información del lugar:</h3>
                    <p><strong>Nombre:</strong> ${lugar.nombre}</p>
                    <p><strong>Calle:</strong> ${lugar.calle}</p>
                    <p><strong>Número:</strong> ${lugar.numero}</p>
                    <p><strong>Comuna:</strong> ${lugar.comuna}</p>
                    <p><strong>Ciudad:</strong> ${lugar.ciudad}</p>
                    <p><strong>Región:</strong> ${lugar.region}</p>
                </div>
            `;
        }

        // Si domicilio_prestacion no es null, agregar bloque HTML
        let domicilioPrestacionHTML = '';
        if (domicilio_prestacion) {
            domicilioPrestacionHTML = `
                <div class="domicilio-prestacion" style="background-color: #f1f8e9; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #8BC34A;">
                    <h3>Domicilio de prestación:</h3>
                    <p>${domicilio_prestacion}</p>
                </div>
            `;
        }

        const asunto = `Marcación de ${marcacion.data.tipo} registrada`;

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
            .empresa-info { background-color: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #2196F3; }
            .lugar-info { background-color: #fffde7; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #FFEB3B; }
            .domicilio-prestacion { background-color: #f1f8e9; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #8BC34A; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            </style>
            </head>
            <body>
            <div class="container">
            <div class="header">
            <h1>Marcación Registrada</h1>
            </div>
            <div class="content">
            <h2>Hola ${usuario.nombre} ${usuario.apellido_pat} ${usuario.apellido_mat},</h2>
            <p>Se ha registrado una nueva marcación en tu cuenta:</p>
            <div class="marcacion-info">
                <h3>Detalles de la marcación:</h3>
                <p><strong>Fecha:</strong> ${new Date(marcacion.data.fecha).toLocaleDateString('es-CL', { year: '2-digit', month: '2-digit', day: '2-digit' })}</p>
                <p><strong>Hora:</strong> ${marcacion.data.hora}</p>
                <p><strong>Nombre completo:</strong> ${usuario.nombre} ${usuario.apellido_pat} ${usuario.apellido_mat}</p>
                <p><strong>RUT:</strong> ${usuario.rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}-${usuario.rut.slice(-1)}</p>
                <p><strong>Geolocalización:</strong> Latitud ${marcacion.data.geo_lat}, Longitud ${marcacion.data.geo_lon}</p>
                <p><strong>Hash:</strong> ${marcacion.data.hash}</p>
                ${marcacion.data.resolucion ? `
                <p><strong>Resolución Número:</strong> ${marcacion.data.resolucion.resolucion_numero || 'No corresponde'}</p>
                <p><strong>Resolución Fecha:</strong> ${marcacion.data.resolucion.resolucion_fecha ? new Date(marcacion.data.resolucion.resolucion_fecha).toLocaleDateString('es-CL', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'No corresponde'}</p>
                ` : ''}
            </div>
            <div class="empresa-info">
                <h3>Información de la empresa:</h3>
                <p><strong>Nombre:</strong> ${empresa.emp_nombre}</p>
                <p><strong>RUT:</strong> ${rutEmpresaFormateado}</p>
            </div>
            ${lugarHTML}
            ${domicilioPrestacionHTML}
            <p>Si no fuiste tú quien realizó esta marcación, contacta inmediatamente con el administrador.</p>
            </div>
            <div class="footer">
            <p>© 2025 Sistema de Control de Asistencia. Todos los derechos reservados.</p>
            </div>
            </div>
            </body>
            </html>
        `;

        return await this.enviarCorreo(usuario.email, asunto, contenidoHTML);
    }

    async enviarNotificacionCodigoAcceso(email, codigo) {
        const asunto = 'Código de Acceso Temporal - Control de Asistencia';
        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Código de Acceso Temporal</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #673AB7; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .code { background-color: #e1bee7; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 24px; text-align: center; letter-spacing: 4px; }
                    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Código de Acceso Temporal</h1>
                    </div>
                    <div class="content">
                        <h2>Hola,</h2>
                        <p>Has solicitado un código de acceso temporal para ingresar al Sistema de Control de Asistencia.</p>
                        <p>Tu código de acceso es:</p>
                        <div class="code">${codigo}</div>
                        <p>Este código es válido por 5 días. Si no solicitaste este código, por favor ignora este correo.</p>
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

    async enviarNotificacionConfirmacionModificacionMarcacion(reporte, data) {
        /**
         * @params {object} reporte - Objeto con los datos del reporte
         * @params {object} data - Objeto con los datos de los cambios realizados
         */
        
        const { marcacionOriginal, fechaModificada, horaModificada } = data;
        const nombreCompleto = `${marcacionOriginal.nombre} ${marcacionOriginal.apellido_pat} ${marcacionOriginal.apellido_mat}`;
        
        const asunto = 'Confirmación de Modificación de Marcación - Acción Requerida';
        const enlaceAprobacion = `${process.env.FRONTEND_URL}/aprobar-modificacion?token=${reporte.token || reporte.id}`;
        
        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Confirmación de Modificación de Marcación</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #FF5722; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .modificacion-info { background-color: #fff3e0; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #FF5722; }
                    .button { display: inline-block; padding: 15px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: bold; }
                    .button:hover { background-color: #45a049; }
                    .warning { background-color: #ffebee; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #f44336; }
                    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Confirmación de Modificación</h1>
                    </div>
                    <div class="content">
                        <h2>Estimado ${nombreCompleto},</h2>
                        <p>Se ha realizado una modificación en su marcación y tiene <strong>48 horas</strong> para aprobar este cambio.</p>
                        
                        <div class="modificacion-info">
                            <h3>Detalles de la modificación:</h3>
                            <p><strong>Marcación Original:</strong></p>
                            <p>• Fecha: ${new Date(marcacionOriginal.fecha).toLocaleDateString('es-CL')}</p>
                            <p>• Hora: ${marcacionOriginal.hora}</p>
                            <p>• Tipo: ${marcacionOriginal.tipo}</p>
                            
                            <p><strong>Datos Modificados:</strong></p>
                            <p>• Nueva Fecha: ${new Date(fechaModificada).toLocaleDateString('es-CL')}</p>
                            <p>• Nueva Hora: ${horaModificada}</p>
                        </div>
                        
                        <div class="warning">
                            <p><strong>⚠️ Importante:</strong> Si no aprueba este cambio dentro de 48 horas, la modificación será aceptado automáticamente.</p>
                        </div>
                        
                        <p>Para confirmar la modificación, haga clic en el siguiente botón:</p>
                        <a href="${enlaceAprobacion}" class="button">Aprobar Cambio</a>
                        
                        <p>Si no realizó esta solicitud o no está de acuerdo con la modificación, puede ignorar este correo.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Sistema de Control de Asistencia. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.enviarCorreo(marcacionOriginal.email, asunto, contenidoHTML);
    }

    async enviarNotificacionConfirmacionNuevaMarcacion(reporte, data) {
        /**
         * @params {object} reporte - Objeto con los datos del reporte
         * @params {object} data - Objeto con los datos de la nueva marcación
         */
        
        const { fechaNueva, horaNueva, tipoNueva, usuario } = data;
        const nombreCompleto = `${usuario.nombre} ${usuario.apellido_pat} ${usuario.apellido_mat}`;
        
        const asunto = 'Confirmación de Nueva Marcación - Acción Requerida';
        const enlaceAprobacion = `${process.env.FRONTEND_URL}/aprobar-modificacion?token=${reporte.token || reporte.id}`;
        
        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Confirmación de Nueva Marcación</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .marcacion-info { background-color: #e8f5e8; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4CAF50; }
                    .button { display: inline-block; padding: 15px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: bold; }
                    .button:hover { background-color: #45a049; }
                    .warning { background-color: #ffebee; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #f44336; }
                    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Confirmación de Nueva Marcación</h1>
                    </div>
                    <div class="content">
                        <h2>Estimado ${nombreCompleto},</h2>
                        <p>Se ha creado una nueva marcación en su registro y tiene <strong>48 horas</strong> para aprobar este registro.</p>
                        
                        <div class="marcacion-info">
                            <h3>Detalles de la nueva marcación:</h3>
                            <p><strong>Fecha:</strong> ${new Date(fechaNueva).toLocaleDateString('es-CL')}</p>
                            <p><strong>Hora:</strong> ${horaNueva}</p>
                            <p><strong>Tipo:</strong> ${tipoNueva}</p>
                            <p><strong>Trabajador:</strong> ${nombreCompleto}</p>
                            <p><strong>RUT:</strong> ${usuario.rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}-${usuario.rut.slice(-1)}</p>
                        </div>
                        
                        <div class="warning">
                            <p><strong>⚠️ Importante:</strong> Si no aprueba esta marcación dentro de 48 horas, el registro será aceptado automáticamente.</p>
                        </div>
                        
                        <p>Para confirmar la nueva marcación, haga clic en el siguiente botón:</p>
                        <a href="${enlaceAprobacion}" class="button">Aprobar Marcación</a>
                        
                        <p>Si no está de acuerdo con esta marcación o considera que es un error, puede ignorar este correo.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Sistema de Control de Asistencia. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.enviarCorreo(usuario.email, asunto, contenidoHTML);
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