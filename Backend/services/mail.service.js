import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import AuthService from './auth.service.js';
import UserModel from '../model/user.model.js';

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
        const asunto = 'RecuperaciÃ³n de ContraseÃ±a - Control de Asistencia';
        const enlaceRecuperacion = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        
        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>RecuperaciÃ³n de ContraseÃ±a</title>
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
                        <h1>RecuperaciÃ³n de ContraseÃ±a</h1>
                    </div>
                    <div class="content">
                        <h2>Hola ${nombreUsuario},</h2>
                        <p>Hemos recibido una solicitud para restablecer la contraseÃ±a de tu cuenta en el Sistema de Control de Asistencia.</p>
                        <p>Para restablecer tu contraseÃ±a, haz clic en el siguiente enlace:</p>
                        <a href="${enlaceRecuperacion}" class="button">Restablecer ContraseÃ±a</a>
                        <p>Este enlace expirarÃ¡ en 1 hora por seguridad.</p>
                        <p>Si no solicitaste este cambio, puedes ignorar este correo electrÃ³nico.</p>
                    </div>
                    <div class="footer">
                        <p>Â© 2025 Sistema de Control de Asistencia. Todos los derechos reservados.</p>
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
                        <h1>Â¡Bienvenido!</h1>
                    </div>
                    <div class="content">
                        <h2>Hola ${nombreUsuario},</h2>
                        <p>Tu cuenta en el Sistema de Control de Asistencia ha sido creada exitosamente.</p>
                        <div class="credentials">
                            <h3>Credenciales de acceso:</h3>
                            <p><strong>Usuario:</strong> ${email}</p>
                            <p><strong>ContraseÃ±a temporal:</strong> ${passwordTemporal}</p>
                        </div>
                        <p><strong>Importante:</strong> Por seguridad, te recomendamos cambiar tu contraseÃ±a despuÃ©s del primer inicio de sesiÃ³n.</p>
                        <a href="${process.env.FRONTEND_URL}/login" class="button">Iniciar SesiÃ³n</a>
                    </div>
                    <div class="footer">
                        <p>Â© 2025 Sistema de Control de Asistencia. Todos los derechos reservados.</p>
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
        @params {object} marcacion - Objeto con los datos de la marcaciÃ³n
        @params {object} empresa - Objeto con los datos de la empresa
        @params {object} lugar - Objeto con los datos del lugar (puede ser null)
        @params {string|null} domicilio_prestacion - DirecciÃ³n de prestaciÃ³n (puede ser null)
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
                    <h3>InformaciÃ³n del lugar:</h3>
                    <p><strong>Nombre:</strong> ${lugar.nombre}</p>
                    <p><strong>Calle:</strong> ${lugar.calle}</p>
                    <p><strong>NÃºmero:</strong> ${lugar.numero}</p>
                    <p><strong>Comuna:</strong> ${lugar.comuna}</p>
                    <p><strong>Ciudad:</strong> ${lugar.ciudad}</p>
                    <p><strong>RegiÃ³n:</strong> ${lugar.region}</p>
                </div>
            `;
        }

        // Si domicilio_prestacion no es null, agregar bloque HTML
        let domicilioPrestacionHTML = '';
        if (domicilio_prestacion) {
            domicilioPrestacionHTML = `
                <div class="domicilio-prestacion" style="background-color: #f1f8e9; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #8BC34A;">
                    <h3>Domicilio de prestaciÃ³n:</h3>
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
                    <h3>InformaciÃ³n de la empresa a la que se prestan servicios:</h3>
                    <p><strong>Nombre:</strong> ${empresa_est.emp_nombre}</p>
                    <p><strong>RUT:</strong> ${rutEmpresaEstFormateado}</p>
                </div>
            `;
        }

        const asunto = `MarcaciÃ³n de ${marcacion.data.tipo} registrada`;

        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">
            <title>MarcaciÃ³n Registrada</title>
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
            <h1>MarcaciÃ³n Registrada</h1>
            </div>
            <div class="content">
            <h2>Hola ${usuario.nombre} ${usuario.apellido_pat} ${usuario.apellido_mat},</h2>
            <p>Se ha registrado una nueva marcaciÃ³n en tu cuenta:</p>
            <div class="marcacion-info">
                <h3>Detalles de la marcaciÃ³n:</h3>
                <p><strong>Fecha:</strong> ${new Date(marcacion.data.fecha).toLocaleDateString('es-CL', { year: '2-digit', month: '2-digit', day: '2-digit' })}</p>
                <p><strong>Hora:</strong> ${marcacion.data.hora}</p>
                <p><strong>Nombre completo:</strong> ${usuario.nombre} ${usuario.apellido_pat} ${usuario.apellido_mat}</p>
                <p><strong>RUT:</strong> ${usuario.rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}-${usuario.rut.slice(-1)}</p>
                <p><strong>GeolocalizaciÃ³n:</strong> Latitud ${marcacion.data.geo_lat}, Longitud ${marcacion.data.geo_lon}</p>
                <p><strong>Hash:</strong> ${marcacion.data.hash}</p>
                ${marcacion.data.resolucion ? `
                <p><strong>ResoluciÃ³n NÃºmero:</strong> ${marcacion.data.resolucion.resolucion_numero || 'No corresponde'}</p>
                <p><strong>ResoluciÃ³n Fecha:</strong> ${marcacion.data.resolucion.resolucion_fecha ? new Date(marcacion.data.resolucion.resolucion_fecha).toLocaleDateString('es-CL', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'No corresponde'}</p>
                ` : ''}
            </div>
            <div class="empresa-info">
                <h3>InformaciÃ³n de la empresa:</h3>
                <p><strong>Nombre:</strong> ${empresa.emp_nombre}</p>
                <p><strong>RUT:</strong> ${rutEmpresaFormateado}</p>
            </div>
            ${empresaEstHTML}
            ${lugarHTML}
            ${domicilioPrestacionHTML}
            <p>Si no fuiste tÃº quien realizÃ³ esta marcaciÃ³n, contacta inmediatamente con el administrador.</p>
            </div>
            <div class="footer">
            <p>Â© 2025 Sistema de Control de Asistencia. Todos los derechos reservados.</p>
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
        @params {object} marcacion - Objeto con los datos de la marcaciÃ³n
        @params {object} empresa - Objeto con los datos de la empresa
        @params {object} lugar - Objeto con los datos del lugar (puede ser null)
        @params {string|null} domicilio_prestacion - DirecciÃ³n de prestaciÃ³n (puede ser null)
        @params {object|null} empresa_est - Objeto con los datos de la empresa establecimiento (puede ser null)
        @params {string} emailEmpresa - Email de la empresa que recibirÃ¡ la notificaciÃ³n
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
                    <h3>InformaciÃ³n del lugar:</h3>
                    <p><strong>Nombre:</strong> ${lugar.nombre}</p>
                    <p><strong>Calle:</strong> ${lugar.calle}</p>
                    <p><strong>NÃºmero:</strong> ${lugar.numero}</p>
                    <p><strong>Comuna:</strong> ${lugar.comuna}</p>
                    <p><strong>Ciudad:</strong> ${lugar.ciudad}</p>
                    <p><strong>RegiÃ³n:</strong> ${lugar.region}</p>
                </div>
            `;
        }

        // Si domicilio_prestacion no es null, agregar bloque HTML
        let domicilioPrestacionHTML = '';
        if (domicilio_prestacion) {
            domicilioPrestacionHTML = `
                <div class="domicilio-prestacion" style="background-color: #f1f8e9; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #8BC34A;">
                    <h3>Domicilio de prestaciÃ³n:</h3>
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
                    <h3>InformaciÃ³n de la empresa a la que se prestan servicios:</h3>
                    <p><strong>Nombre:</strong> ${empresa_est.emp_nombre}</p>
                    <p><strong>RUT:</strong> ${rutEmpresaEstFormateado}</p>
                </div>
            `;
        }

        const asunto = `Copia de marcaciÃ³n de ${marcacion.data.tipo} - Trabajador: ${usuarioTrabajador.nombre} ${usuarioTrabajador.apellido_pat}`;

        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">
            <title>Copia de MarcaciÃ³n Registrada</title>
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
            <h1>Copia de MarcaciÃ³n Registrada</h1>
            </div>
            <div class="content">
            <h2>Estimada Empresa,</h2>
            
            <div class="copia-info">
                <p><strong>ðŸ“‹ InformaciÃ³n:</strong> Esta es una copia de los datos de marcaciÃ³n que se registraron para su trabajador en el Sistema de Control de Asistencia.</p>
            </div>
            
            <div class="trabajador-info">
                <h3>Datos del trabajador:</h3>
                <p><strong>Nombre completo:</strong> ${usuarioTrabajador.nombre} ${usuarioTrabajador.apellido_pat} ${usuarioTrabajador.apellido_mat}</p>
                <p><strong>RUT:</strong> ${usuarioTrabajador.rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}-${usuarioTrabajador.rut.slice(-1)}</p>
                <p><strong>Email:</strong> ${usuarioTrabajador.email}</p>
            </div>
            
            <div class="marcacion-info">
                <h3>Detalles de la marcaciÃ³n:</h3>
                <p><strong>Fecha:</strong> ${new Date(marcacion.data.fecha).toLocaleDateString('es-CL', { year: '2-digit', month: '2-digit', day: '2-digit' })}</p>
                <p><strong>Hora:</strong> ${marcacion.data.hora}</p>
                <p><strong>Tipo:</strong> ${marcacion.data.tipo}</p>
                <p><strong>GeolocalizaciÃ³n:</strong> Latitud ${marcacion.data.geo_lat}, Longitud ${marcacion.data.geo_lon}</p>
                <p><strong>Hash:</strong> ${marcacion.data.hash}</p>
                ${marcacion.data.resolucion ? `
                <p><strong>ResoluciÃ³n NÃºmero:</strong> ${marcacion.data.resolucion.resolucion_numero || 'No corresponde'}</p>
                <p><strong>ResoluciÃ³n Fecha:</strong> ${marcacion.data.resolucion.resolucion_fecha ? new Date(marcacion.data.resolucion.resolucion_fecha).toLocaleDateString('es-CL', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'No corresponde'}</p>
                ` : ''}
            </div>
            <div class="empresa-info">
                <h3>InformaciÃ³n de la empresa empleadora:</h3>
                <p><strong>Nombre:</strong> ${empresa.emp_nombre}</p>
                <p><strong>RUT:</strong> ${rutEmpresaFormateado}</p>
            </div>
            ${empresaEstHTML}
            ${lugarHTML}
            ${domicilioPrestacionHTML}
            <p>Esta notificaciÃ³n se envÃ­a como respaldo de la actividad de marcaciÃ³n de su trabajador. Para cualquier consulta o aclaraciÃ³n, puede contactar directamente con el trabajador o con el sistema de administraciÃ³n.</p>
            </div>
            <div class="footer">
            <p>Â© 2025 Sistema de Control de Asistencia. Todos los derechos reservados.</p>
            </div>
            </div>
            </body>
            </html>
        `;

        return await this.enviarCorreo(emailEmpresa, asunto, contenidoHTML);
    }

    async enviarNotificacionCodigoAcceso(email, codigo) {
        const asunto = 'CÃ³digo de Acceso Temporal - Control de Asistencia';
        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>CÃ³digo de Acceso Temporal</title>
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
                        <h1>CÃ³digo de Acceso Temporal</h1>
                    </div>
                    <div class="content">
                        <h2>Hola,</h2>
                        <p>Has solicitado un cÃ³digo de acceso temporal para ingresar al Sistema de Control de Asistencia.</p>
                        <p>Tu cÃ³digo de acceso es:</p>
                        <div class="code">${codigo}</div>
                        <p>Este cÃ³digo es vÃ¡lido por 5 dÃ­as. Si no solicitaste este cÃ³digo, por favor ignora este correo.</p>
                    </div>
                    <div class="footer">
                        <p>Â© 2025 Sistema de Control de Asistencia. Todos los derechos reservados.</p>
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
        
        const asunto = 'ConfirmaciÃ³n de ModificaciÃ³n de MarcaciÃ³n - AcciÃ³n Requerida';

        const token = AuthService.generarTokenAceptacionCambios(reporte.id);
        const enlaceAprobacion = `${process.env.FRONTEND_URL}/aprobar-modificacion?token=${token}`;

        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>ConfirmaciÃ³n de ModificaciÃ³n de MarcaciÃ³n</title>
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
                        <h1>ConfirmaciÃ³n de ModificaciÃ³n</h1>
                    </div>
                    <div class="content">
                        <h2>Estimado ${nombreCompleto},</h2>
                        <p>Se ha realizado una modificaciÃ³n en su marcaciÃ³n y tiene <strong>48 horas</strong> para aprobar este cambio.</p>
                        
                        <div class="modificacion-info">
                            <h3>Detalles de la modificaciÃ³n:</h3>
                            <p><strong>MarcaciÃ³n Original:</strong></p>
                            <p>â€¢ Fecha: ${new Date(marcacionOriginal.fecha).toLocaleDateString('es-CL')}</p>
                            <p>â€¢ Hora: ${marcacionOriginal.hora}</p>
                            <p>â€¢ Tipo: ${marcacionOriginal.tipo}</p>
                            
                            <p><strong>Datos Modificados:</strong></p>
                            <p>â€¢ Nueva Fecha: ${new Date(fechaModificada).toLocaleDateString('es-CL')}</p>
                            <p>â€¢ Nueva Hora: ${horaModificada}</p>
                        </div>
                        
                        <div class="warning">
                            <p><strong>âš ï¸ Importante:</strong> Si no aprueba este cambio dentro de 48 horas, la modificaciÃ³n serÃ¡ aceptado automÃ¡ticamente.</p>
                        </div>
                        
                        <p>Para confirmar la modificaciÃ³n, haga clic en el siguiente botÃ³n:</p>
                        <a href="${enlaceAprobacion}" class="button">Aprobar Cambio</a>
                        
                        <p>Si no realizÃ³ esta solicitud o no estÃ¡ de acuerdo con la modificaciÃ³n, puede ignorar este correo.</p>
                    </div>
                    <div class="footer">
                        <p>Â© 2025 Sistema de Control de Asistencia. Todos los derechos reservados.</p>
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
         * @params {object} data - Objeto con los datos de la nueva marcaciÃ³n
         */
        
        const { fechaNueva, horaNueva, tipoNueva, usuario } = data;
        const nombreCompleto = `${usuario.nombre} ${usuario.apellido_pat} ${usuario.apellido_mat}`;
        
        const asunto = 'ConfirmaciÃ³n de Nueva MarcaciÃ³n - AcciÃ³n Requerida';
        const token = AuthService.generarTokenAceptacionCambios(reporte.id);
        const enlaceAprobacion = `${process.env.FRONTEND_URL}/aprobar-modificacion?token=${token}`;

        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>ConfirmaciÃ³n de Nueva MarcaciÃ³n</title>
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
                        <h1>ConfirmaciÃ³n de Nueva MarcaciÃ³n</h1>
                    </div>
                    <div class="content">
                        <h2>Estimado ${nombreCompleto},</h2>
                        <p>Se ha creado una nueva marcaciÃ³n en su registro y tiene <strong>48 horas</strong> para aprobar este registro.</p>
                        
                        <div class="marcacion-info">
                            <h3>Detalles de la nueva marcaciÃ³n:</h3>
                            <p><strong>Fecha:</strong> ${new Date(fechaNueva).toLocaleDateString('es-CL')}</p>
                            <p><strong>Hora:</strong> ${horaNueva}</p>
                            <p><strong>Tipo:</strong> ${tipoNueva}</p>
                            <p><strong>Trabajador:</strong> ${nombreCompleto}</p>
                            <p><strong>RUT:</strong> ${usuario.rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}-${usuario.rut.slice(-1)}</p>
                        </div>
                        
                        <div class="warning">
                            <p><strong>âš ï¸ Importante:</strong> Si no aprueba esta marcaciÃ³n dentro de 48 horas, el registro serÃ¡ aceptado automÃ¡ticamente.</p>
                        </div>
                        
                        <p>Para confirmar la nueva marcaciÃ³n, haga clic en el siguiente botÃ³n:</p>
                        <a href="${enlaceAprobacion}" class="button">Aprobar MarcaciÃ³n</a>
                        
                        <p>Si no estÃ¡ de acuerdo con esta marcaciÃ³n o considera que es un error, puede ignorar este correo.</p>
                    </div>
                    <div class="footer">
                        <p>Â© 2025 Sistema de Control de Asistencia. Todos los derechos reservados.</p>
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
         * @params {object} marcacionOriginal - Objeto con los datos de la marcaciÃ³n original
         * @params {object} data - Objeto con los nuevos datos de la marcaciÃ³n
         * @params {string} reporteId - ID del reporte para generar el enlace de acciÃ³n
         */
        
        const nombreCompleto = `${usuarioEmpresa.usuario_nombre} ${usuarioEmpresa.usuario_apellido_pat} ${usuarioEmpresa.usuario_apellido_mat}`;
        const rutFormateado = usuarioEmpresa.usuario_rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '-' + usuarioEmpresa.usuario_rut.slice(-1);
        
        // Generar token y enlace de respuesta
        const token = AuthService.generarTokenAceptacionCambios(reporteId);
        const enlaceRespuesta = `${process.env.FRONTEND_URL}/aprobar-modificacion?token=${token}`;
        
        const asunto = 'Solicitud de ModificaciÃ³n de MarcaciÃ³n - AcciÃ³n Requerida';
        
        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Solicitud de ModificaciÃ³n de MarcaciÃ³n</title>
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
                        <h1>Solicitud de ModificaciÃ³n de MarcaciÃ³n</h1>
                    </div>
                    <div class="content">
                        <h2>Estimado ${nombreCompleto},</h2>
                        <p>Se ha realizado una solicitud de modificaciÃ³n para una de sus marcaciones y tiene <strong>48 horas</strong> para responder a esta solicitud.</p>
                        
                        <div class="empresa-info">
                            <h3>InformaciÃ³n de la empresa:</h3>
                            <p><strong>Empresa:</strong> ${usuarioEmpresa.empresa_nombre}</p>
                            <p><strong>RUT Empresa:</strong> ${usuarioEmpresa.empresa_rut}</p>
                        </div>

                        <div class="original-info">
                            <h3>ðŸ“‹ Datos originales de la marcaciÃ³n:</h3>
                            <p><strong>Fecha:</strong> ${new Date(marcacionOriginal.fecha).toLocaleDateString('es-CL')}</p>
                            <p><strong>Hora:</strong> ${marcacionOriginal.hora}</p>
                            <p><strong>Tipo:</strong> ${marcacionOriginal.tipo}</p>
                            <p><strong>Hash:</strong> ${marcacionOriginal.hash}</p>
                        </div>
                        
                        <div class="nueva-info">
                            <h3>âœï¸ Datos propuestos para la modificaciÃ³n:</h3>
                            <p><strong>Nueva Fecha:</strong> ${new Date(data.fecha).toLocaleDateString('es-CL')}</p>
                            <p><strong>Nueva Hora:</strong> ${data.hora}</p>
                            <p><strong>Nuevo Tipo:</strong> ${data.tipo}</p>
                            ${data.motivo ? `<p><strong>Motivo de la modificaciÃ³n:</strong> ${data.motivo}</p>` : ''}
                        </div>
                        
                        <div class="modificacion-info">
                            <h3>InformaciÃ³n del trabajador:</h3>
                            <p><strong>Nombre:</strong> ${nombreCompleto}</p>
                            <p><strong>RUT:</strong> ${rutFormateado}</p>
                            <p><strong>Email:</strong> ${usuarioEmpresa.usuario_email}</p>
                            <p><strong>Rol en empresa:</strong> ${usuarioEmpresa.rol_en_empresa}</p>
                        </div>
                        
                        <div class="warning">
                            <p><strong>âš ï¸ Importante:</strong> Si no responde a esta solicitud dentro de 48 horas, la modificaciÃ³n serÃ¡ aceptada automÃ¡ticamente.</p>
                        </div>
                        
                        <p>Para revisar y responder a esta solicitud, haga clic en el siguiente enlace:</p>
                        <a href="${enlaceRespuesta}" class="button">Revisar ModificaciÃ³n</a>
                        
                        <p>Si tiene alguna duda sobre esta modificaciÃ³n o considera que es un error, puede contactar con el administrador del sistema.</p>
                    </div>
                    <div class="footer">
                        <p>Â© 2025 Sistema de Control de Asistencia. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.enviarCorreo(usuarioEmpresa.usuario_email, asunto, contenidoHTML);
    }

    // MÃ©todo auxiliar para convertir HTML a texto plano
    htmlToText(html) {
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .trim();
    }

    // Verificar conexiÃ³n
    async verificarConexion() {
        try {
            await this.transporter.verify();
            return {
                success: true,
                message: 'ConfiguraciÃ³n de correo vÃ¡lida'
            };
        } catch (error) {
            console.error('Error en configuraciÃ³n de correo:', error);
            return {
                success: false,
                message: 'Error en configuraciÃ³n de correo',
                error: error.message
            };
        }
    }


    async enviarCorreoNotificacionEmpleador(email){
        const asunto = 'NotificaciÃ³n de Inicio de Procedimiento de FiscalizaciÃ³n Laboral';
                
        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>NotificaciÃ³n de FiscalizaciÃ³n Laboral</title>
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
                        <h1>ðŸ›ï¸ NotificaciÃ³n Oficial</h1>
                        <p style="margin: 5px 0 0 0; font-size: 16px;">Procedimiento de FiscalizaciÃ³n Laboral</p>
                    </div>
                    <div class="content">
                        <h2>Estimado Empleador,</h2>
                        
                        <div class="notification-box">
                            <p class="important">ðŸ“‹ NOTIFICACIÃ“N OFICIAL DE FISCALIZACIÃ“N LABORAL</p>
                        </div>
                        
                        <div class="legal-text">
                            <p>Se informa a usted que, de acuerdo con las facultades y obligaciones legales contenidas en el <strong>CÃ³digo del Trabajo</strong> y sus leyes complementarias; en el <strong>D.F.L. NÂ°2 de 1967, del Ministerio del Trabajo y PrevisiÃ³n Social</strong>, y en otras disposiciones reglamentarias, se estÃ¡ iniciando un <span class="important">procedimiento de fiscalizaciÃ³n laboral</span>.</p>
                        </div>
                        
                        <div style="background-color: #fff3e0; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ff9800;">
                            <p><strong>âš ï¸ Esta es una notificaciÃ³n oficial</strong> y debe ser tratada con la debida importancia y urgencia que amerita un procedimiento de fiscalizaciÃ³n laboral.</p>
                        </div>
                        
                        <p>Se le solicita mantener disponible toda la documentaciÃ³n laboral correspondiente para cuando sea requerida por la autoridad competente.</p>
                        
                        <p>Para cualquier consulta relacionada con este procedimiento, debe dirigirse a la oficina de la InspecciÃ³n del Trabajo correspondiente a su jurisdicciÃ³n.</p>
                        
                    </div>
                    <div class="footer">
                        <p>Â© 2025 Sistema de Control de Asistencia - NotificaciÃ³n Oficial</p>
                        <p>Esta comunicaciÃ³n se realiza en cumplimiento de las disposiciones legales vigentes</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.enviarCorreo(email, asunto, contenidoHTML);
    }

    async enviarNotificacionAmonestacion(trabajador, amonestacion, empresa, pdfPath) {
        /**
        @params {object} trabajador - Objeto con los datos del trabajador
        @params {object} amonestacion - Objeto con los datos de la amonestaciÃ³n
        @params {object} empresa - Objeto con los datos de la empresa
        @params {string} pdfPath - Ruta del archivo PDF a adjuntar
        */

        // Formatear RUT trabajador con puntos y guion
        const rutTrabajadorFormateado = trabajador.rut
            ? trabajador.rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '-' + trabajador.rut.slice(-1)
            : '';

        // Formatear RUT empresa con puntos y guion
        const rutEmpresaFormateado = empresa.emp_rut
            ? empresa.emp_rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '-' + empresa.emp_rut.slice(-1)
            : '';

        // Formatear fecha del hecho
        const fechaHecho = amonestacion.fecha_hecho
            ? new Date(amonestacion.fecha_hecho).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })
            : 'No especificada';

        // Formatear plazo descargos
        const plazoDescargos = amonestacion.plazo_descargos
            ? new Date(amonestacion.plazo_descargos).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })
            : 'No especificado';

        const asunto = `NotificaciÃ³n de AmonestaciÃ³n - ${empresa.emp_nombre}`;

        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">
            <title>NotificaciÃ³n de AmonestaciÃ³n</title>
            <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .amonestacion-info { background-color: #ffebee; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #e74c3c; }
            .trabajador-info { background-color: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #2196F3; }
            .empresa-info { background-color: #f3e5f5; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #9C27B0; }
            .warning-box { background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ffc107; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .important { color: #e74c3c; font-weight: bold; }
            </style>
            </head>
            <body>
            <div class="container">
            <div class="header">
            <h1>âš ï¸ NotificaciÃ³n de AmonestaciÃ³n</h1>
            </div>
            <div class="content">
            <h2>Estimado/a ${trabajador.nombre} ${trabajador.apellido_pat} ${trabajador.apellido_mat},</h2>
            
            <p>Por medio del presente correo electrÃ³nico, se le notifica que ha sido objeto de una amonestaciÃ³n laboral.</p>
            
            <div class="trabajador-info">
                <h3>Datos del trabajador:</h3>
                <p><strong>Nombre completo:</strong> ${trabajador.nombre} ${trabajador.apellido_pat} ${trabajador.apellido_mat}</p>
                <p><strong>RUT:</strong> ${rutTrabajadorFormateado}</p>
                ${amonestacion.cargo ? `<p><strong>Cargo:</strong> ${amonestacion.cargo}</p>` : ''}
                ${amonestacion.area_departamento ? `<p><strong>Ãrea/Departamento:</strong> ${amonestacion.area_departamento}</p>` : ''}
            </div>
            
            <div class="amonestacion-info">
                <h3>Detalles de la amonestaciÃ³n:</h3>
                <p><strong>NÃºmero de documento:</strong> ${amonestacion.id}</p>
                <p><strong>Fecha del hecho:</strong> ${fechaHecho}</p>
                <p><strong>Tipo de falta:</strong> ${amonestacion.tipo_falta}</p>
                <p><strong>Tipo de sanciÃ³n:</strong> ${amonestacion.tipo_sancion}</p>
                ${amonestacion.monto_multa ? `<p><strong>Monto multa:</strong> $${amonestacion.monto_multa.toLocaleString('es-CL')}</p>` : ''}
                ${amonestacion.supervisor_responsable ? `<p><strong>Supervisor responsable:</strong> ${amonestacion.supervisor_responsable}</p>` : ''}
            </div>

            <div class="empresa-info">
                <h3>InformaciÃ³n de la empresa:</h3>
                <p><strong>Empresa:</strong> ${empresa.emp_nombre}</p>
                <p><strong>RUT:</strong> ${rutEmpresaFormateado}</p>
            </div>
            
            ${amonestacion.plazo_descargos ? `
            <div class="warning-box">
                <h3 class="important">â° PLAZO PARA PRESENTAR DESCARGOS</h3>
                <p>Usted tiene hasta el <strong>${plazoDescargos}</strong> para presentar sus descargos por escrito ante la empresa.</p>
                <p>Es importante que ejerza su derecho a defensa dentro del plazo establecido.</p>
            </div>
            ` : ''}
            
            <p><strong>ðŸ“Ž Documento adjunto:</strong> Se adjunta al presente correo el documento formal de amonestaciÃ³n en formato PDF con todos los detalles y fundamentos de esta medida disciplinaria.</p>
            
            <p>Para cualquier consulta o aclaraciÃ³n, puede contactar con el Ã¡rea de Recursos Humanos de la empresa.</p>
            
            </div>
            <div class="footer">
            <p>Â© 2025 Sistema de Control de Asistencia. Todos los derechos reservados.</p>
            <p>Este es un correo generado automÃ¡ticamente, por favor no responder.</p>
            </div>
            </div>
            </body>
            </html>
        `;

        try {
            const mailOptions = {
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                to: trabajador.email,
                subject: asunto,
                html: contenidoHTML,
                attachments: [
                    {
                        filename: `Amonestacion_${amonestacion.id}_${trabajador.rut}.pdf`,
                        path: pdfPath,
                        contentType: 'application/pdf'
                    }
                ]
            };

            const info = await this.transporter.sendMail(mailOptions);

            console.log('âœ… NotificaciÃ³n de amonestaciÃ³n enviada:', info.messageId);

            return {
                success: true,
                message: 'NotificaciÃ³n de amonestaciÃ³n enviada correctamente',
                messageId: info.messageId
            };
        } catch (error) {
            console.error('âŒ Error enviando notificaciÃ³n de amonestaciÃ³n:', error);
            return {
                success: false,
                message: 'Error al enviar la notificaciÃ³n de amonestaciÃ³n',
                error: error.message
            };
        }
    }


    async enviarNotificacionCambioTurno(usuario, tipoTurnoAnterior, nuevoTipoTurno, pdfPath) {
        /**
        @params {object} usuario - Objeto con los datos del usuario y empresa
        @params {object} tipoTurnoAnterior - Objeto con los datos del turno anterior
        @params {object} nuevoTipoTurno - Objeto con los datos del nuevo turno
        @params {string} pdfPath - Ruta del archivo PDF a adjuntar
        */

        // Formatear RUT trabajador con puntos y guion
        const rutTrabajadorFormateado = usuario.usuario_rut
            ? usuario.usuario_rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '-' + usuario.usuario_rut.slice(-1)
            : '';

        // Formatear RUT empresa con puntos y guion
        const rutEmpresaFormateado = usuario.empresa_rut
            ? usuario.empresa_rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '-' + usuario.empresa_rut.slice(-1)
            : '';

        // Formatear fechas
        const fechaInicio = usuario.fecha_inicio
            ? new Date(usuario.fecha_inicio).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })
            : 'No especificada';

        const asunto = `NotificaciÃ³n de Cambio de Turno - ${usuario.empresa_nombre}`;

        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">
            <title>NotificaciÃ³n de Cambio de Turno</title>
            <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3f51b5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .turno-anterior { background-color: #ffebee; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #f44336; }
            .turno-nuevo { background-color: #e8f5e8; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4caf50; }
            .trabajador-info { background-color: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #2196F3; }
            .empresa-info { background-color: #f3e5f5; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #9C27B0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .important { color: #3f51b5; font-weight: bold; }
            </style>
            </head>
            <body>
            <div class="container">
            <div class="header">
            <h1>ðŸ“… NotificaciÃ³n de Cambio de Turno</h1>
            </div>
            <div class="content">
            <h2>Estimado/a ${usuario.usuario_nombre} ${usuario.usuario_apellido_pat} ${usuario.usuario_apellido_mat},</h2>
            
            <p>Por medio del presente correo electrÃ³nico, se le notifica que ha sido asignado a un nuevo turno de trabajo.</p>
            
            <div class="trabajador-info">
                <h3>Datos del trabajador:</h3>
                <p><strong>Nombre completo:</strong> ${usuario.usuario_nombre} ${usuario.usuario_apellido_pat} ${usuario.usuario_apellido_mat}</p>
                <p><strong>RUT:</strong> ${rutTrabajadorFormateado}</p>
                <p><strong>Email:</strong> ${usuario.usuario_email}</p>
                <p><strong>Rol en empresa:</strong> ${usuario.rol_en_empresa}</p>
                <p><strong>Fecha de inicio en empresa:</strong> ${fechaInicio}</p>
            </div>
            
            <div class="turno-anterior">
                <h3>ðŸ“‹ Turno anterior:</h3>
                <p><strong>Nombre:</strong> ${tipoTurnoAnterior.nombre}</p>
                ${tipoTurnoAnterior.descripcion ? `<p><strong>DescripciÃ³n:</strong> ${tipoTurnoAnterior.descripcion}</p>` : ''}
                <p><strong>Horario:</strong> ${tipoTurnoAnterior.hora_inicio} - ${tipoTurnoAnterior.hora_fin}</p>
                ${tipoTurnoAnterior.colacion_inicio && tipoTurnoAnterior.colacion_fin ? 
                    `<p><strong>Horario de colaciÃ³n:</strong> ${tipoTurnoAnterior.colacion_inicio} - ${tipoTurnoAnterior.colacion_fin}</p>` : ''}
                <p><strong>DÃ­as de trabajo:</strong> ${tipoTurnoAnterior.dias_trabajo} dÃ­as</p>
                <p><strong>DÃ­as de descanso:</strong> ${tipoTurnoAnterior.dias_descanso} dÃ­as</p>
            </div>

            <div class="turno-nuevo">
                <h3>âœ… Nuevo turno asignado:</h3>
                <p><strong>Nombre:</strong> ${nuevoTipoTurno.nombre}</p>
                ${nuevoTipoTurno.descripcion ? `<p><strong>DescripciÃ³n:</strong> ${nuevoTipoTurno.descripcion}</p>` : ''}
                <p><strong>Horario:</strong> ${nuevoTipoTurno.hora_inicio} - ${nuevoTipoTurno.hora_fin}</p>
                ${nuevoTipoTurno.colacion_inicio && nuevoTipoTurno.colacion_fin ? 
                    `<p><strong>Horario de colaciÃ³n:</strong> ${nuevoTipoTurno.colacion_inicio} - ${nuevoTipoTurno.colacion_fin}</p>` : ''}
                <p><strong>DÃ­as de trabajo:</strong> ${nuevoTipoTurno.dias_trabajo} dÃ­as</p>
                <p><strong>DÃ­as de descanso:</strong> ${nuevoTipoTurno.dias_descanso} dÃ­as</p>
            </div>

            <div class="empresa-info">
                <h3>InformaciÃ³n de la empresa:</h3>
                <p><strong>Empresa:</strong> ${usuario.empresa_nombre}</p>
                <p><strong>RUT:</strong> ${rutEmpresaFormateado}</p>
            </div>
            
            <p><strong>ðŸ“Ž Documento adjunto:</strong> Se adjunta al presente correo el documento formal de cambio de turno en formato PDF con todos los detalles de la modificaciÃ³n.</p>
            
            <p>Para cualquier consulta o aclaraciÃ³n sobre este cambio de turno, puede contactar con el Ã¡rea de Recursos Humanos de la empresa.</p>
            
            </div>
            <div class="footer">
            <p>Â© 2025 Sistema de Control de Asistencia. Todos los derechos reservados.</p>
            <p>Este es un correo generado automÃ¡ticamente, por favor no responder.</p>
            </div>
            </div>
            </body>
            </html>
        `;

        try {
            const mailOptions = {
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                to: usuario.usuario_email,
                subject: asunto,
                html: contenidoHTML,
                attachments: [
                    {
                        filename: `CambioTurno_${usuario.usuario_rut}_${new Date().toISOString().split('T')[0]}.pdf`,
                        path: pdfPath,
                        contentType: 'application/pdf'
                    }
                ]
            };

            const info = await this.transporter.sendMail(mailOptions);

            console.log('âœ… NotificaciÃ³n de cambio de turno enviada:', info.messageId);

            return {
                success: true,
                message: 'NotificaciÃ³n de cambio de turno enviada correctamente',
                messageId: info.messageId
            };
        } catch (error) {
            console.error('âŒ Error enviando notificaciÃ³n de cambio de turno:', error);
            return {
                success: false,
                message: 'Error al enviar la notificaciÃ³n de cambio de turno',
                error: error.message
            };
        }
    }

    async enviarNotificacionAprobacionSolicitud(usuarioSolicitante, solicitud, usuarioQueAprueba, empresa, observaciones = null) {
        const asunto = `âœ… Solicitud Aprobada - ${solicitud.tipo}`;
        
        const tiposDescripcion = {
            'permiso_con_goce': 'Permiso con goce de sueldo',
            'permiso_sin_goce': 'Permiso sin goce de sueldo',
            'uso_feriado': 'Uso de feriado',
            'licencia_medica': 'Licencia mÃ©dica',
            'otro': 'Solicitud'
        };

        const tipoDescripcion = tiposDescripcion[solicitud.subtipo] || solicitud.subtipo;
        console.log(usuarioQueAprueba);
        const usuarioAprobadorData = await UserModel.findById(usuarioQueAprueba.id);
        console.log(usuarioAprobadorData);
        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">
            <title>Solicitud Aprobada</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 4px 4px 0 0; }
                .content { padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; }
                .alert-success { background-color: #d4edda; color: #155724; padding: 12px; border-left: 4px solid #4CAF50; margin: 15px 0; }
                .info-box { background-color: #e7f3ff; padding: 15px; border-left: 4px solid #2196F3; margin: 15px 0; }
                .details { margin: 20px 0; }
                .detail-row { display: flex; margin: 10px 0; padding: 8px; background-color: white; border-radius: 4px; }
                .detail-label { font-weight: bold; width: 150px; color: #666; }
                .detail-value { flex: 1; }
                .observaciones { margin-top: 15px; padding: 12px; background-color: #fffbcc; border-left: 4px solid #ff9800; border-radius: 4px; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; }
            </style>
            </head>
            <body>
            <div class="container">
                <div class="header">
                <h1>âœ… Solicitud Aprobada</h1>
                </div>
                <div class="content">
                <h2>Hola ${usuarioSolicitante.nombre} ${usuarioSolicitante.apellido_pat},</h2>
                
                <div class="alert-success">
                    <strong>Tu solicitud ha sido APROBADA correctamente</strong>
                </div>

                <div class="details">
                    <h3>Detalles de la Solicitud</h3>
                    <div class="detail-row">
                    <span class="detail-label">Tipo de solicitud:</span>
                    <span class="detail-value">${tipoDescripcion}</span>
                    </div>
                    <div class="detail-row">
                    <span class="detail-label">PerÃ­odo:</span>
                    <span class="detail-value">Desde ${new Date(solicitud.fecha_inicio).toLocaleDateString('es-CL')} hasta ${new Date(solicitud.fecha_fin).toLocaleDateString('es-CL')}</span>
                    </div>
                    <div class="detail-row">
                    <span class="detail-label">Empresa:</span>
                    <span class="detail-value">${empresa.emp_nombre}</span>
                    </div>
                    <div class="detail-row">
                    <span class="detail-label">Aprobado por:</span>
                    <span class="detail-value">${usuarioAprobadorData.nombre} ${usuarioAprobadorData.apellido_pat}</span>
                    </div>
                    <div class="detail-row">
                    <span class="detail-label">Fecha de aprobaciÃ³n:</span>
                    <span class="detail-value">${new Date().toLocaleDateString('es-CL')}</span>
                    </div>
                </div>

                ${observaciones ? `
                    <div class="observaciones">
                    <strong>ðŸ“ Observaciones:</strong>
                    <p>${observaciones}</p>
                    </div>
                ` : ''}

                <div class="info-box">
                    <strong>â„¹ï¸ InformaciÃ³n importante:</strong>
                    <p>Tu solicitud ha sido procesada y aprobada. Por favor, asegÃºrate de que esta informaciÃ³n estÃ© registrada en tus registros personales.</p>
                </div>

                <p>Si tienes alguna pregunta, contacta con el Ã¡rea de Recursos Humanos de tu empresa.</p>
                </div>
                <div class="footer">
                <p>Â© 2025 Sistema de Control de Asistencia. Todos los derechos reservados.</p>
                <p>Este es un correo generado automÃ¡ticamente, por favor no responder.</p>
                </div>
            </div>
            </body>
            </html>
        `;

        try {
            const mailOptions = {
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                to: usuarioSolicitante.email,
                subject: asunto,
                html: contenidoHTML
            };

            const info = await this.transporter.sendMail(mailOptions);

            console.log('âœ… NotificaciÃ³n de aprobaciÃ³n de solicitud enviada:', info.messageId);

            return {
                success: true,
                message: 'NotificaciÃ³n de aprobaciÃ³n enviada correctamente',
                messageId: info.messageId
            };
        } catch (error) {
            console.error('âŒ Error enviando notificaciÃ³n de aprobaciÃ³n:', error);
            return {
                success: false,
                message: 'Error al enviar la notificaciÃ³n de aprobaciÃ³n',
                error: error.message
            };
        }
    }

    async enviarNotificacionRechazosolicitud(usuarioSolicitante, solicitud, usuarioQueRechaza, empresa, datosRechazo = {}) {
        const asunto = `âŒ Solicitud Rechazada - ${solicitud.tipo}`;
        
        const tiposDescripcion = {
            'permiso_con_goce': 'Permiso con goce de sueldo',
            'permiso_sin_goce': 'Permiso sin goce de sueldo',
            'uso_feriado': 'Uso de feriado',
            'licencia_medica': 'Licencia mÃ©dica',
            'otro': 'Solicitud'
        };

        const tipoDescripcion = tiposDescripcion[solicitud.subtipo] || solicitud.subtipo;
        console.log(usuarioQueRechaza);
        const usuarioAprobadorData = await UserModel.findById(usuarioQueRechaza.id);
        console.log(usuarioAprobadorData);

        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">
            <title>Solicitud Rechazada</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #f44336; color: white; padding: 20px; text-align: center; border-radius: 4px 4px 0 0; }
                .content { padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; }
                .alert-danger { background-color: #f8d7da; color: #721c24; padding: 12px; border-left: 4px solid #f44336; margin: 15px 0; }
                .info-box { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ff9800; margin: 15px 0; }
                .details { margin: 20px 0; }
                .detail-row { display: flex; margin: 10px 0; padding: 8px; background-color: white; border-radius: 4px; }
                .detail-label { font-weight: bold; width: 150px; color: #666; }
                .detail-value { flex: 1; }
                .motivo { margin-top: 15px; padding: 12px; background-color: #ffe6e6; border-left: 4px solid #f44336; border-radius: 4px; }
                .apelacion { margin-top: 15px; padding: 12px; background-color: #e3f2fd; border-left: 4px solid #2196F3; border-radius: 4px; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; }
            </style>
            </head>
            <body>
            <div class="container">
                <div class="header">
                <h1>âŒ Solicitud Rechazada</h1>
                </div>
                <div class="content">
                <h2>Hola ${usuarioSolicitante.nombre} ${usuarioSolicitante.apellido_pat},</h2>
                
                <div class="alert-danger">
                    <strong>Tu solicitud ha sido RECHAZADA</strong>
                </div>

                <div class="details">
                    <h3>Detalles de la Solicitud</h3>
                    <div class="detail-row">
                    <span class="detail-label">Tipo de solicitud:</span>
                    <span class="detail-value">${tipoDescripcion}</span>
                    </div>
                    <div class="detail-row">
                    <span class="detail-label">PerÃ­odo:</span>
                    <span class="detail-value">Desde ${new Date(solicitud.fecha_inicio).toLocaleDateString('es-CL', { year: '2-digit', month: '2-digit', day: '2-digit' })} hasta ${new Date(solicitud.fecha_fin).toLocaleDateString('es-CL', { year: '2-digit', month: '2-digit', day: '2-digit' })}</span>
                    </div>
                    <div class="detail-row">
                    <span class="detail-label">Empresa:</span>
                    <span class="detail-value">${empresa.emp_nombre}</span>
                    </div>
                    <div class="detail-row">
                    <span class="detail-label">Rechazado por:</span>
                    <span class="detail-value">${usuarioAprobadorData.nombre} ${usuarioAprobadorData.apellido_pat}</span>
                    </div>
                    <div class="detail-row">
                    <span class="detail-label">Fecha de rechazo:</span>
                    <span class="detail-value">${new Date().toLocaleDateString('es-CL', { year: '2-digit', month: '2-digit', day: '2-digit' })}</span>
                    </div>
                </div>

                ${datosRechazo.motivo ? `
                    <div class="motivo">
                    <strong>âŒ Motivo del Rechazo:</strong>
                    <p>${datosRechazo.motivo}</p>
                    </div>
                ` : ''}

                ${datosRechazo.observaciones ? `
                    <div class="info-box">
                    <strong>ðŸ“ Observaciones adicionales:</strong>
                    <p>${datosRechazo.observaciones}</p>
                    </div>
                ` : ''}

                ${datosRechazo.plazo_apelacion || datosRechazo.instancia_apelacion ? `
                    <div class="apelacion">
                    <strong>ðŸ“‹ InformaciÃ³n de ApelaciÃ³n:</strong>
                    ${datosRechazo.plazo_apelacion ? `<p><strong>Plazo para apelar:</strong> ${datosRechazo.plazo_apelacion}</p>` : ''}
                    ${datosRechazo.instancia_apelacion ? `<p><strong>Instancia de apelaciÃ³n:</strong> ${datosRechazo.instancia_apelacion}</p>` : ''}
                    <p>Puedes presentar una apelaciÃ³n dentro del plazo indicado ante la instancia especificada si consideras que hay motivos vÃ¡lidos.</p>
                    </div>
                ` : ''}

                <div class="info-box">
                    <strong>â„¹ï¸ PrÃ³ximos pasos:</strong>
                    <p>Si deseas mÃ¡s informaciÃ³n sobre este rechazo o si tienes dudas, contacta con el Ã¡rea de Recursos Humanos o la instancia indicada.</p>
                </div>
                </div>
                <div class="footer">
                <p>Â© 2025 Sistema de Control de Asistencia. Todos los derechos reservados.</p>
                <p>Este es un correo generado automÃ¡ticamente, por favor no responder.</p>
                </div>
            </div>
            </body>
            </html>
        `;

        try {
            const mailOptions = {
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                to: usuarioSolicitante.email,
                subject: asunto,
                html: contenidoHTML
            };

            const info = await this.transporter.sendMail(mailOptions);

            console.log('âœ… NotificaciÃ³n de rechazo de solicitud enviada:', info.messageId);

            return {
                success: true,
                message: 'NotificaciÃ³n de rechazo enviada correctamente',
                messageId: info.messageId
            };
        } catch (error) {
            console.error('âŒ Error enviando notificaciÃ³n de rechazo:', error);
            return {
                success: false,
                message: 'Error al enviar la notificaciÃ³n de rechazo',
                error: error.message
            };
        }

    }

    async enviarNotificacionAprobacionSolicitudCopiaEmpleador(usuarioSolicitante, solicitud, usuarioQueAprueba, empresa) {
            const asunto = `âœ… Copia de Solicitud Aprobada - ${solicitud.tipo}`;
            
            const tiposDescripcion = {
                'permiso_con_goce': 'Permiso con goce de sueldo',
                'permiso_sin_goce': 'Permiso sin goce de sueldo',
                'uso_feriado': 'Uso de feriado',
                'licencia_medica': 'Licencia mÃ©dica',
                'otro': 'Solicitud'
            };

            const tipoDescripcion = tiposDescripcion[solicitud.subtipo] || solicitud.subtipo;
            const usuarioAprobadorData = await UserModel.findById(usuarioQueAprueba.id);
            
            const contenidoHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                <meta charset="UTF-8">
                <title>Copia de Solicitud Aprobada</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 4px 4px 0 0; }
                    .content { padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; }
                    .alert-success { background-color: #d4edda; color: #155724; padding: 12px; border-left: 4px solid #4CAF50; margin: 15px 0; }
                    .info-box { background-color: #e7f3ff; padding: 15px; border-left: 4px solid #2196F3; margin: 15px 0; }
                    .trabajador-info { background-color: #e8f5e8; padding: 15px; border-left: 4px solid #4CAF50; margin: 15px 0; }
                    .details { margin: 20px 0; }
                    .detail-row { display: flex; margin: 10px 0; padding: 8px; background-color: white; border-radius: 4px; }
                    .detail-label { font-weight: bold; width: 150px; color: #666; }
                    .detail-value { flex: 1; }
                    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; }
                    .copia-info { background-color: #f3e5f5; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #9C27B0; font-style: italic; }
                </style>
                </head>
                <body>
                <div class="container">
                    <div class="header">
                    <h1>ðŸ“‹ Copia de Solicitud Aprobada</h1>
                    </div>
                    <div class="content">
                    <h2>Estimado Empleador,</h2>
                    
                    <div class="copia-info">
                        <p><strong>ðŸ“‹ InformaciÃ³n:</strong> Esta es una copia informativa de una solicitud que ha sido aprobada para uno de sus trabajadores en el Sistema de Control de Asistencia.</p>
                    </div>

                    <div class="alert-success">
                        <strong>La siguiente solicitud ha sido APROBADA</strong>
                    </div>

                    <div class="trabajador-info">
                        <h3>Datos del Trabajador</h3>
                        <div class="detail-row">
                            <span class="detail-label">Nombre completo:</span>
                            <span class="detail-value">${usuarioSolicitante.nombre} ${usuarioSolicitante.apellido_pat} ${usuarioSolicitante.apellido_mat}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">RUT:</span>
                            <span class="detail-value">${usuarioSolicitante.rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}-${usuarioSolicitante.rut.slice(-1)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Email:</span>
                            <span class="detail-value">${usuarioSolicitante.email}</span>
                        </div>
                    </div>

                    <div class="details">
                        <h3>Detalles de la Solicitud Aprobada</h3>
                        <div class="detail-row">
                        <span class="detail-label">Tipo de solicitud:</span>
                        <span class="detail-value">${tipoDescripcion}</span>
                        </div>
                        <div class="detail-row">
                        <span class="detail-label">PerÃ­odo:</span>
                        <span class="detail-value">Desde ${new Date(solicitud.fecha_inicio).toLocaleDateString('es-CL')} hasta ${new Date(solicitud.fecha_fin).toLocaleDateString('es-CL')}</span>
                        </div>
                        <div class="detail-row">
                        <span class="detail-label">Empresa:</span>
                        <span class="detail-value">${empresa.emp_nombre}</span>
                        </div>
                        <div class="detail-row">
                        <span class="detail-label">Aprobado por:</span>
                        <span class="detail-value">${usuarioAprobadorData.nombre} ${usuarioAprobadorData.apellido_pat}</span>
                        </div>
                        <div class="detail-row">
                        <span class="detail-label">Fecha de aprobaciÃ³n:</span>
                        <span class="detail-value">${new Date().toLocaleDateString('es-CL')}</span>
                        </div>
                    </div>

                    <div class="info-box">
                        <strong>â„¹ï¸ InformaciÃ³n para el empleador:</strong>
                        <p>Esta notificaciÃ³n se envÃ­a como respaldo de la gestiÃ³n de solicitudes de su trabajador. El empleado ha sido notificado por separado de la aprobaciÃ³n de su solicitud.</p>
                        <p>Para cualquier consulta o aclaraciÃ³n sobre esta solicitud, puede contactar directamente con el trabajador o con el administrador del sistema.</p>
                    </div>
                    </div>
                    <div class="footer">
                    <p>Â© 2025 Sistema de Control de Asistencia. Todos los derechos reservados.</p>
                    <p>Este es un correo generado automÃ¡ticamente, por favor no responder.</p>
                    </div>
                </div>
                </body>
                </html>
            `;

            try {
                const mailOptions = {
                    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                    to: usuarioAprobadorData.email,
                    subject: asunto,
                    html: contenidoHTML
                };

                const info = await this.transporter.sendMail(mailOptions);

                console.log('âœ… Copia de notificaciÃ³n de aprobaciÃ³n enviada al empleador:', info.messageId);

                return {
                    success: true,
                    message: 'Copia de notificaciÃ³n enviada al empleador correctamente',
                    messageId: info.messageId
                };
            } catch (error) {
                console.error('âŒ Error enviando copia al empleador:', error);
                return {
                    success: false,
                    message: 'Error al enviar la copia al empleador',
                    error: error.message
                };
            }
    }

    async enviarInvitacionEmpresa({
        destinatario,
        nombreDestinatario,
        nombreEmpresa,
        linkAceptacion,
        passwordTemporal = null,
        esUsuarioNuevo = false
    }) {
        try {
            const asunto = `InvitaciÃ³n para unirte a ${nombreEmpresa}`;
            
            const contenidoHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>InvitaciÃ³n a Empresa</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="padding: 40px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                                ðŸ“§ InvitaciÃ³n a Empresa
                            </h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                Hola <strong>${nombreDestinatario}</strong>,
                            </p>
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                Has sido invitado a unirte a la empresa <strong>${nombreEmpresa}</strong> en el sistema TeleAsiste.
                            </p>
                            ${esUsuarioNuevo ? `
                            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
                                <p style="margin: 0 0 10px; font-size: 14px; color: #555555;">
                                    <strong>ðŸ“ Credenciales de acceso:</strong>
                                </p>
                                <p style="margin: 0 0 5px; font-size: 14px; color: #555555;">
                                    <strong>Usuario:</strong> ${destinatario}
                                </p>
                                <p style="margin: 0; font-size: 14px; color: #555555;">
                                    <strong>ContraseÃ±a temporal:</strong> <code style="background-color: #e9ecef; padding: 2px 6px; border-radius: 3px;">${passwordTemporal}</code>
                                </p>
                                <p style="margin: 10px 0 0; font-size: 12px; color: #666666; font-style: italic;">
                                    âš ï¸ Se te pedirÃ¡ cambiar la contraseÃ±a en tu primer inicio de sesiÃ³n.
                                </p>
                            </div>
                            ` : `
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                Ya tienes una cuenta en TeleAsiste. Solo necesitas aceptar esta invitaciÃ³n para comenzar a trabajar con ${nombreEmpresa}.
                            </p>
                            `}
                            <p style="margin: 20px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                                Para aceptar o rechazar esta invitaciÃ³n, haz clic en el siguiente botÃ³n:
                            </p>
                            <table role="presentation" style="margin: 30px 0; width: 100%;">
                                <tr>
                                    <td align="center">
                                        <a href="${linkAceptacion}" 
                                           style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                            Ver InvitaciÃ³n
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 20px 0 10px; font-size: 14px; line-height: 1.6; color: #666666;">
                                O copia y pega este enlace en tu navegador:
                            </p>
                            <p style="margin: 0; font-size: 12px; word-break: break-all; color: #667eea;">
                                ${linkAceptacion}
                            </p>
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                                <p style="margin: 0; font-size: 12px; color: #999999; line-height: 1.6;">
                                    â° Esta invitaciÃ³n expirarÃ¡ en 7 dÃ­as.<br>
                                    ðŸ”’ Si no solicitaste esta invitaciÃ³n, puedes ignorar este correo.
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">
                                <strong>TeleAsiste</strong> - Sistema de Control de Asistencia
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #999999;">
                                Este es un correo automÃ¡tico, por favor no responder.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `;

            return await this.enviarCorreo(destinatario, asunto, contenidoHTML);

        } catch (error) {
            console.error('Error al enviar invitaciÃ³n de empresa:', error);
            return {
                success: false,
                message: 'Error al enviar invitaciÃ³n',
                error: error.message
            };
        }
    }

}
        
export default new MailService();