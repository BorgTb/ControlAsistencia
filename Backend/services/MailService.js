import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import AuthService from './authservice.js';

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


    
    async enviarNotificacionMarcacion(usuario, marcacion, empresa, lugar, domicilio_prestacion, empresa_est) {
        /**
        @params {object} usuario - Objeto con los datos del usuario
        @params {object} marcacion - Objeto con los datos de la marcación
        @params {object} empresa - Objeto con los datos de la empresa
        @params {object} lugar - Objeto con los datos del lugar (puede ser null)
        @params {string|null} domicilio_prestacion - Dirección de prestación (puede ser null)
        @params {object|null} empresa_est - Objeto con los datos de la empresa establecimiento (puede ser null)
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

        // Si empresa_est no es null, agregar bloque HTML de empresa establecimiento
        let empresaEstHTML = '';
        if (empresa_est) {
            const rutEmpresaEstFormateado = empresa_est.emp_rut
                ? empresa_est.emp_rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '-' + empresa_est.emp_rut.slice(-1)
                : '';
            
            empresaEstHTML = `
                <div class="empresa-est-info" style="background-color: #e8f5e8; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                    <h3>Información de la empresa a la que se prestan servicios:</h3>
                    <p><strong>Nombre:</strong> ${empresa_est.emp_nombre}</p>
                    <p><strong>RUT:</strong> ${rutEmpresaEstFormateado}</p>
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
            .empresa-est-info { background-color: #e8f5e8; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4CAF50; }
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
            ${empresaEstHTML}
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

    async enviarNotificacionMarcacionEmpresa(usuarioTrabajador, marcacion, empresa, lugar, domicilio_prestacion, empresa_est, emailEmpresa) {
        /**
        @params {object} usuarioTrabajador - Objeto con los datos del trabajador
        @params {object} marcacion - Objeto con los datos de la marcación
        @params {object} empresa - Objeto con los datos de la empresa
        @params {object} lugar - Objeto con los datos del lugar (puede ser null)
        @params {string|null} domicilio_prestacion - Dirección de prestación (puede ser null)
        @params {object|null} empresa_est - Objeto con los datos de la empresa establecimiento (puede ser null)
        @params {string} emailEmpresa - Email de la empresa que recibirá la notificación
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

        // Si empresa_est no es null, agregar bloque HTML de empresa establecimiento
        let empresaEstHTML = '';
        if (empresa_est) {
            const rutEmpresaEstFormateado = empresa_est.emp_rut
                ? empresa_est.emp_rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '-' + empresa_est.emp_rut.slice(-1)
                : '';
            
            empresaEstHTML = `
                <div class="empresa-est-info" style="background-color: #e8f5e8; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                    <h3>Información de la empresa a la que se prestan servicios:</h3>
                    <p><strong>Nombre:</strong> ${empresa_est.emp_nombre}</p>
                    <p><strong>RUT:</strong> ${rutEmpresaEstFormateado}</p>
                </div>
            `;
        }

        const asunto = `Copia de marcación de ${marcacion.data.tipo} - Trabajador: ${usuarioTrabajador.nombre} ${usuarioTrabajador.apellido_pat}`;

        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">
            <title>Copia de Marcación Registrada</title>
            <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .marcacion-info { background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #FF9800; }
            .trabajador-info { background-color: #e1f5fe; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #03A9F4; }
            .empresa-info { background-color: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #2196F3; }
            .empresa-est-info { background-color: #e8f5e8; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4CAF50; }
            .lugar-info { background-color: #fffde7; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #FFEB3B; }
            .domicilio-prestacion { background-color: #f1f8e9; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #8BC34A; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .copia-info { background-color: #f3e5f5; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #9C27B0; font-style: italic; }
            </style>
            </head>
            <body>
            <div class="container">
            <div class="header">
            <h1>Copia de Marcación Registrada</h1>
            </div>
            <div class="content">
            <h2>Estimada Empresa,</h2>
            
            <div class="copia-info">
                <p><strong>📋 Información:</strong> Esta es una copia de los datos de marcación que se registraron para su trabajador en el Sistema de Control de Asistencia.</p>
            </div>
            
            <div class="trabajador-info">
                <h3>Datos del trabajador:</h3>
                <p><strong>Nombre completo:</strong> ${usuarioTrabajador.nombre} ${usuarioTrabajador.apellido_pat} ${usuarioTrabajador.apellido_mat}</p>
                <p><strong>RUT:</strong> ${usuarioTrabajador.rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}-${usuarioTrabajador.rut.slice(-1)}</p>
                <p><strong>Email:</strong> ${usuarioTrabajador.email}</p>
            </div>
            
            <div class="marcacion-info">
                <h3>Detalles de la marcación:</h3>
                <p><strong>Fecha:</strong> ${new Date(marcacion.data.fecha).toLocaleDateString('es-CL', { year: '2-digit', month: '2-digit', day: '2-digit' })}</p>
                <p><strong>Hora:</strong> ${marcacion.data.hora}</p>
                <p><strong>Tipo:</strong> ${marcacion.data.tipo}</p>
                <p><strong>Geolocalización:</strong> Latitud ${marcacion.data.geo_lat}, Longitud ${marcacion.data.geo_lon}</p>
                <p><strong>Hash:</strong> ${marcacion.data.hash}</p>
                ${marcacion.data.resolucion ? `
                <p><strong>Resolución Número:</strong> ${marcacion.data.resolucion.resolucion_numero || 'No corresponde'}</p>
                <p><strong>Resolución Fecha:</strong> ${marcacion.data.resolucion.resolucion_fecha ? new Date(marcacion.data.resolucion.resolucion_fecha).toLocaleDateString('es-CL', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'No corresponde'}</p>
                ` : ''}
            </div>
            <div class="empresa-info">
                <h3>Información de la empresa empleadora:</h3>
                <p><strong>Nombre:</strong> ${empresa.emp_nombre}</p>
                <p><strong>RUT:</strong> ${rutEmpresaFormateado}</p>
            </div>
            ${empresaEstHTML}
            ${lugarHTML}
            ${domicilioPrestacionHTML}
            <p>Esta notificación se envía como respaldo de la actividad de marcación de su trabajador. Para cualquier consulta o aclaración, puede contactar directamente con el trabajador o con el sistema de administración.</p>
            </div>
            <div class="footer">
            <p>© 2025 Sistema de Control de Asistencia. Todos los derechos reservados.</p>
            </div>
            </div>
            </body>
            </html>
        `;

        return await this.enviarCorreo(emailEmpresa, asunto, contenidoHTML);
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

        const token = AuthService.generarTokenAceptacionCambios(reporte.id);
        const enlaceAprobacion = `${process.env.FRONTEND_URL}/aprobar-modificacion?token=${token}`;

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
        const token = AuthService.generarTokenAceptacionCambios(reporte.id);
        const enlaceAprobacion = `${process.env.FRONTEND_URL}/aprobar-modificacion?token=${token}`;

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

    async enviarNotificacionModificacionMarcacion(usuarioEmpresa, marcacionOriginal, data, reporteId) {
        /**
         * @params {object} usuarioEmpresa - Objeto con los datos del usuario y empresa
         * @params {object} marcacionOriginal - Objeto con los datos de la marcación original
         * @params {object} data - Objeto con los nuevos datos de la marcación
         * @params {string} reporteId - ID del reporte para generar el enlace de acción
         */
        
        const nombreCompleto = `${usuarioEmpresa.usuario_nombre} ${usuarioEmpresa.usuario_apellido_pat} ${usuarioEmpresa.usuario_apellido_mat}`;
        const rutFormateado = usuarioEmpresa.usuario_rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '-' + usuarioEmpresa.usuario_rut.slice(-1);
        
        // Generar token y enlace de respuesta
        const token = AuthService.generarTokenAceptacionCambios(reporteId);
        const enlaceRespuesta = `${process.env.FRONTEND_URL}/aprobar-modificacion?token=${token}`;
        
        const asunto = 'Solicitud de Modificación de Marcación - Acción Requerida';
        
        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Solicitud de Modificación de Marcación</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .modificacion-info { background-color: #fff3e0; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #FF9800; }
                    .original-info { background-color: #ffebee; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #f44336; }
                    .nueva-info { background-color: #e8f5e8; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4CAF50; }
                    .button { display: inline-block; padding: 15px 30px; background-color: #FF9800; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: bold; }
                    .button:hover { background-color: #f57c00; }
                    .warning { background-color: #ffebee; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #f44336; }
                    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                    .empresa-info { background-color: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #2196F3; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Solicitud de Modificación de Marcación</h1>
                    </div>
                    <div class="content">
                        <h2>Estimado ${nombreCompleto},</h2>
                        <p>Se ha realizado una solicitud de modificación para una de sus marcaciones y tiene <strong>48 horas</strong> para responder a esta solicitud.</p>
                        
                        <div class="empresa-info">
                            <h3>Información de la empresa:</h3>
                            <p><strong>Empresa:</strong> ${usuarioEmpresa.empresa_nombre}</p>
                            <p><strong>RUT Empresa:</strong> ${usuarioEmpresa.empresa_rut}</p>
                        </div>

                        <div class="original-info">
                            <h3>📋 Datos originales de la marcación:</h3>
                            <p><strong>Fecha:</strong> ${new Date(marcacionOriginal.fecha).toLocaleDateString('es-CL')}</p>
                            <p><strong>Hora:</strong> ${marcacionOriginal.hora}</p>
                            <p><strong>Tipo:</strong> ${marcacionOriginal.tipo}</p>
                            <p><strong>Hash:</strong> ${marcacionOriginal.hash}</p>
                        </div>
                        
                        <div class="nueva-info">
                            <h3>✏️ Datos propuestos para la modificación:</h3>
                            <p><strong>Nueva Fecha:</strong> ${new Date(data.fecha).toLocaleDateString('es-CL')}</p>
                            <p><strong>Nueva Hora:</strong> ${data.hora}</p>
                            <p><strong>Nuevo Tipo:</strong> ${data.tipo}</p>
                            ${data.motivo ? `<p><strong>Motivo de la modificación:</strong> ${data.motivo}</p>` : ''}
                        </div>
                        
                        <div class="modificacion-info">
                            <h3>Información del trabajador:</h3>
                            <p><strong>Nombre:</strong> ${nombreCompleto}</p>
                            <p><strong>RUT:</strong> ${rutFormateado}</p>
                            <p><strong>Email:</strong> ${usuarioEmpresa.usuario_email}</p>
                            <p><strong>Rol en empresa:</strong> ${usuarioEmpresa.rol_en_empresa}</p>
                        </div>
                        
                        <div class="warning">
                            <p><strong>⚠️ Importante:</strong> Si no responde a esta solicitud dentro de 48 horas, la modificación será aceptada automáticamente.</p>
                        </div>
                        
                        <p>Para revisar y responder a esta solicitud, haga clic en el siguiente enlace:</p>
                        <a href="${enlaceRespuesta}" class="button">Revisar Modificación</a>
                        
                        <p>Si tiene alguna duda sobre esta modificación o considera que es un error, puede contactar con el administrador del sistema.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Sistema de Control de Asistencia. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.enviarCorreo(usuarioEmpresa.usuario_email, asunto, contenidoHTML);
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


    async enviarCorreoNotificacionEmpleador(email){
        const asunto = 'Notificación de Inicio de Procedimiento de Fiscalización Laboral';
                
        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Notificación de Fiscalización Laboral</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
                    .container { max-width: 700px; margin: 0 auto; padding: 20px; background-color: white; }
                    .header { background-color: #c62828; color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { padding: 30px; background-color: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .notification-box { background-color: #ffebee; padding: 20px; border-left: 5px solid #c62828; margin: 20px 0; border-radius: 4px; }
                    .legal-text { background-color: #f9f9f9; padding: 20px; border-radius: 4px; margin: 20px 0; font-style: italic; }
                    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background-color: #f5f5f5; }
                    .important { font-weight: bold; color: #c62828; }
                    .icon { font-size: 24px; margin-right: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏛️ Notificación Oficial</h1>
                        <p style="margin: 5px 0 0 0; font-size: 16px;">Procedimiento de Fiscalización Laboral</p>
                    </div>
                    <div class="content">
                        <h2>Estimado Empleador,</h2>
                        
                        <div class="notification-box">
                            <p class="important">📋 NOTIFICACIÓN OFICIAL DE FISCALIZACIÓN LABORAL</p>
                        </div>
                        
                        <div class="legal-text">
                            <p>Se informa a usted que, de acuerdo con las facultades y obligaciones legales contenidas en el <strong>Código del Trabajo</strong> y sus leyes complementarias; en el <strong>D.F.L. N°2 de 1967, del Ministerio del Trabajo y Previsión Social</strong>, y en otras disposiciones reglamentarias, se está iniciando un <span class="important">procedimiento de fiscalización laboral</span>.</p>
                        </div>
                        
                        <div style="background-color: #fff3e0; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ff9800;">
                            <p><strong>⚠️ Esta es una notificación oficial</strong> y debe ser tratada con la debida importancia y urgencia que amerita un procedimiento de fiscalización laboral.</p>
                        </div>
                        
                        <p>Se le solicita mantener disponible toda la documentación laboral correspondiente para cuando sea requerida por la autoridad competente.</p>
                        
                        <p>Para cualquier consulta relacionada con este procedimiento, debe dirigirse a la oficina de la Inspección del Trabajo correspondiente a su jurisdicción.</p>
                        
                    </div>
                    <div class="footer">
                        <p>© 2025 Sistema de Control de Asistencia - Notificación Oficial</p>
                        <p>Esta comunicación se realiza en cumplimiento de las disposiciones legales vigentes</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.enviarCorreo(email, asunto, contenidoHTML);
    }
}

export default new MailService();