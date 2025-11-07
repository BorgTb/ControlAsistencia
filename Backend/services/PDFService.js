import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PDFService {
    /**
     * Genera un PDF de amonestación
     * @param {Object} amonestacion - Datos de la amonestación
     * @param {Object} trabajador - Datos del trabajador
     * @param {Object} empresa - Datos de la empresa
     * @returns {Promise<Buffer>} - Buffer del PDF generado
     */
    async generarPDFAmonestacion(amonestacion, trabajador, empresa) {
        return new Promise((resolve, reject) => {
            try {
                // Crear un nuevo documento PDF
                const doc = new PDFDocument({
                    size: 'LETTER',
                    margins: {
                        top: 50,
                        bottom: 50,
                        left: 50,
                        right: 50
                    }
                });

                // Crear un buffer para almacenar el PDF
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Función auxiliar para formatear RUT
                const formatearRUT = (rut) => {
                    if (!rut) return 'No especificado';
                    return rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '-' + rut.slice(-1);
                };

                // Función auxiliar para formatear fecha
                const formatearFecha = (fecha) => {
                    if (!fecha) return 'No especificada';
                    return new Date(fecha).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                };

                // Función auxiliar para agregar línea horizontal
                const agregarLineaHorizontal = (y) => {
                    doc.moveTo(50, y)
                       .lineTo(562, y)
                       .stroke('#cccccc');
                };

                // === ENCABEZADO ===
                doc.fontSize(20)
                   .font('Helvetica-Bold')
                   .fillColor('#2c3e50')
                   .text('CARTA DE AMONESTACIÓN', { align: 'center' });

                doc.fontSize(10)
                   .font('Helvetica')
                   .fillColor('#7f8c8d')
                   .text(`Documento Nº ${amonestacion.id}`, { align: 'center' })
                   .moveDown();

                agregarLineaHorizontal(doc.y);
                doc.moveDown();

                // === INFORMACIÓN DE LA EMPRESA ===
                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .fillColor('#2c3e50')
                   .text('INFORMACIÓN DE LA EMPRESA', 50, doc.y);
                
                doc.moveDown(0.5);

                doc.fontSize(10)
                   .font('Helvetica')
                   .fillColor('#34495e');

                doc.text(`Empresa:`, 50, doc.y)
                   .font('Helvetica-Bold')
                   .text(empresa.emp_nombre || 'No especificada', 150, doc.y - 12);

                doc.font('Helvetica')
                   .text(`RUT:`, 50, doc.y + 5)
                   .font('Helvetica-Bold')
                   .text(formatearRUT(empresa.emp_rut), 150, doc.y - 12);

                doc.moveDown(1.5);
                agregarLineaHorizontal(doc.y);
                doc.moveDown();

                // === INFORMACIÓN DEL TRABAJADOR ===
                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .fillColor('#2c3e50')
                   .text('INFORMACIÓN DEL TRABAJADOR', 50, doc.y);

                doc.moveDown(0.5);

                doc.fontSize(10)
                   .font('Helvetica')
                   .fillColor('#34495e');

                doc.text(`Nombre:`, 50, doc.y)
                   .font('Helvetica-Bold')
                   .text(`${trabajador.nombre} ${trabajador.apellido_pat} ${trabajador.apellido_mat}`, 150, doc.y - 12);

                doc.font('Helvetica')
                   .text(`RUT:`, 50, doc.y + 5)
                   .font('Helvetica-Bold')
                   .text(formatearRUT(trabajador.rut), 150, doc.y - 12);

                if (amonestacion.cargo) {
                    doc.font('Helvetica')
                       .text(`Cargo:`, 50, doc.y + 5)
                       .font('Helvetica-Bold')
                       .text(amonestacion.cargo, 150, doc.y - 12);
                }

                if (amonestacion.area_departamento) {
                    doc.font('Helvetica')
                       .text(`Área/Depto:`, 50, doc.y + 5)
                       .font('Helvetica-Bold')
                       .text(amonestacion.area_departamento, 150, doc.y - 12);
                }

                doc.moveDown(1.5);
                agregarLineaHorizontal(doc.y);
                doc.moveDown();

                // === DETALLES DE LA AMONESTACIÓN ===
                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .fillColor('#2c3e50')
                   .text('DETALLES DE LA AMONESTACIÓN', 50, doc.y);

                doc.moveDown(0.5);

                doc.fontSize(10)
                   .font('Helvetica')
                   .fillColor('#34495e');

                doc.text(`Fecha del hecho:`, 50, doc.y)
                   .font('Helvetica-Bold')
                   .text(formatearFecha(amonestacion.fecha_hecho), 150, doc.y - 12);

                doc.font('Helvetica')
                   .text(`Tipo de falta:`, 50, doc.y + 5)
                   .font('Helvetica-Bold')
                   .text(amonestacion.tipo_falta, 150, doc.y - 12);

                doc.font('Helvetica')
                   .text(`Tipo de sanción:`, 50, doc.y + 5)
                   .font('Helvetica-Bold')
                   .text(amonestacion.tipo_sancion, 150, doc.y - 12);

                if (amonestacion.monto_multa) {
                    doc.font('Helvetica')
                       .text(`Monto multa:`, 50, doc.y + 5)
                       .font('Helvetica-Bold')
                       .text(`$${amonestacion.monto_multa.toLocaleString('es-CL')}`, 150, doc.y - 12);
                }

                if (amonestacion.supervisor_responsable) {
                    doc.font('Helvetica')
                       .text(`Supervisor:`, 50, doc.y + 5)
                       .font('Helvetica-Bold')
                       .text(amonestacion.supervisor_responsable, 150, doc.y - 12);
                }

                doc.moveDown(1.5);

                // === DESCRIPCIÓN DETALLADA ===
                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .fillColor('#2c3e50')
                   .text('DESCRIPCIÓN DETALLADA DE LOS HECHOS', 50, doc.y);

                doc.moveDown(0.5);

                doc.fontSize(10)
                   .font('Helvetica')
                   .fillColor('#34495e')
                   .text(amonestacion.descripcion_detallada || 'No especificada', 50, doc.y, {
                       width: 500,
                       align: 'justify'
                   });

                doc.moveDown(1.5);

                // === NORMA INFRINGIDA ===
                if (amonestacion.norma_infringida) {
                    doc.fontSize(12)
                       .font('Helvetica-Bold')
                       .fillColor('#2c3e50')
                       .text('NORMA O REGLAMENTO INFRINGIDO', 50, doc.y);

                    doc.moveDown(0.5);

                    doc.fontSize(10)
                       .font('Helvetica')
                       .fillColor('#34495e')
                       .text(amonestacion.norma_infringida, 50, doc.y, {
                           width: 500,
                           align: 'justify'
                       });

                    doc.moveDown(1.5);
                }

                // === PLAZO PARA DESCARGOS ===
                if (amonestacion.plazo_descargos) {
                    doc.fontSize(12)
                       .font('Helvetica-Bold')
                       .fillColor('#e74c3c')
                       .text('PLAZO PARA PRESENTAR DESCARGOS', 50, doc.y);

                    doc.moveDown(0.5);

                    doc.fontSize(10)
                       .font('Helvetica')
                       .fillColor('#34495e')
                       .text(`El trabajador tiene hasta el ${formatearFecha(amonestacion.plazo_descargos)} para presentar sus descargos por escrito.`, 50, doc.y, {
                           width: 500,
                           align: 'justify'
                       });

                    doc.moveDown(1.5);
                }

                // === OBSERVACIONES RRHH ===
                if (amonestacion.observaciones_rrhh) {
                    doc.fontSize(12)
                       .font('Helvetica-Bold')
                       .fillColor('#2c3e50')
                       .text('OBSERVACIONES DE RECURSOS HUMANOS', 50, doc.y);

                    doc.moveDown(0.5);

                    doc.fontSize(10)
                       .font('Helvetica')
                       .fillColor('#34495e')
                       .text(amonestacion.observaciones_rrhh, 50, doc.y, {
                           width: 500,
                           align: 'justify'
                       });

                    doc.moveDown(1.5);
                }

                // Verificar si necesitamos una nueva página para las firmas
                if (doc.y > 650) {
                    doc.addPage();
                }

                doc.moveDown(2);
                agregarLineaHorizontal(doc.y);
                doc.moveDown(2);

                // === FIRMAS ===
                const firmaY = doc.y;
                
                // Firma del empleador
                doc.fontSize(10)
                   .font('Helvetica')
                   .fillColor('#34495e');

                doc.text('_________________________', 80, firmaY);
                doc.text('Firma Empleador/Representante', 80, firmaY + 20, { width: 150, align: 'center' });
                doc.text(`Fecha: ${formatearFecha(new Date())}`, 80, firmaY + 40, { width: 150, align: 'center' });

                // Firma del trabajador
                doc.text('_________________________', 350, firmaY);
                doc.text('Firma Trabajador', 350, firmaY + 20, { width: 150, align: 'center' });
                doc.text('(Recepción del documento)', 350, firmaY + 35, { width: 150, align: 'center', fontSize: 8 });

                // === PIE DE PÁGINA ===
                doc.fontSize(8)
                   .fillColor('#95a5a6')
                   .text(
                       `Documento generado el ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL')} | Sistema de Control de Asistencia`,
                       50,
                       730,
                       { align: 'center', width: 512 }
                   );

                // Finalizar el documento
                doc.end();

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Guarda temporalmente el PDF en el sistema de archivos
     * @param {Buffer} pdfBuffer - Buffer del PDF
     * @param {string} filename - Nombre del archivo
     * @returns {Promise<string>} - Path del archivo guardado
     */
    async guardarPDFTemporal(pdfBuffer, filename) {
        return new Promise((resolve, reject) => {
            try {
                const tempDir = path.join(__dirname, '../temp');
                
                // Crear directorio temp si no existe
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }

                const filePath = path.join(tempDir, filename);
                
                fs.writeFile(filePath, pdfBuffer, (err) => {
                    if (err) reject(err);
                    else resolve(filePath);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Elimina un archivo temporal
     * @param {string} filePath - Path del archivo a eliminar
     */
    async eliminarArchivoTemporal(filePath) {
        return new Promise((resolve, reject) => {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error eliminando archivo temporal:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async generarPdfCambioTurno(trabajador, tipoTurnoAnterior, nuevoTipoTurno) {
        return new Promise((resolve, reject) => {
            try {
                // Crear un nuevo documento PDF
                const doc = new PDFDocument({
                    size: 'LETTER',
                    margins: {
                        top: 50,
                        bottom: 50,
                        left: 50,
                        right: 50
                    }
                });

                // Crear un buffer para almacenar el PDF
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Función auxiliar para formatear RUT
                const formatearRUT = (rut) => {
                    if (!rut) return 'No especificado';
                    return rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '-' + rut.slice(-1);
                };

                // Función auxiliar para formatear fecha
                const formatearFecha = (fecha) => {
                    if (!fecha) return 'No especificada';
                    return new Date(fecha).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                };

                // Función auxiliar para agregar línea horizontal
                const agregarLineaHorizontal = (y) => {
                    doc.moveTo(50, y)
                       .lineTo(562, y)
                       .stroke('#cccccc');
                };

                // === ENCABEZADO ===
                doc.fontSize(20)
                   .font('Helvetica-Bold')
                   .fillColor('#2c3e50')
                   .text('NOTIFICACIÓN DE CAMBIO DE TURNO', { align: 'center' });

                doc.fontSize(10)
                   .font('Helvetica')
                   .fillColor('#7f8c8d')
                   .text(`Documento Nº ${trabajador.id}`, { align: 'center' })
                   .moveDown();

                agregarLineaHorizontal(doc.y);
                doc.moveDown();

                // === INFORMACIÓN DE LA EMPRESA ===
                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .fillColor('#2c3e50')
                   .text('INFORMACIÓN DE LA EMPRESA', 50, doc.y);
                
                doc.moveDown(0.5);

                doc.fontSize(10)
                   .font('Helvetica')
                   .fillColor('#34495e');

                doc.text(`Empresa:`, 50, doc.y)
                   .font('Helvetica-Bold')
                   .text(trabajador.empresa_nombre || 'No especificada', 150, doc.y - 12);

                doc.font('Helvetica')
                   .text(`RUT:`, 50, doc.y + 5)
                   .font('Helvetica-Bold')
                   .text(formatearRUT(trabajador.empresa_rut), 150, doc.y - 12);

                doc.moveDown(1.5);
                agregarLineaHorizontal(doc.y);
                doc.moveDown();

                // === INFORMACIÓN DEL TRABAJADOR ===
                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .fillColor('#2c3e50')
                   .text('INFORMACIÓN DEL TRABAJADOR', 50, doc.y);

                doc.moveDown(0.5);

                doc.fontSize(10)
                   .font('Helvetica')
                   .fillColor('#34495e');

                doc.text(`Nombre:`, 50, doc.y)
                   .font('Helvetica-Bold')
                   .text(`${trabajador.usuario_nombre} ${trabajador.usuario_apellido_pat} ${trabajador.usuario_apellido_mat}`, 150, doc.y - 12);

                doc.font('Helvetica')
                   .text(`RUT:`, 50, doc.y + 5)
                   .font('Helvetica-Bold')
                   .text(formatearRUT(trabajador.usuario_rut), 150, doc.y - 12);

                doc.font('Helvetica')
                   .text(`Email:`, 50, doc.y + 5)
                   .font('Helvetica-Bold')
                   .text(trabajador.usuario_email, 150, doc.y - 12);

                doc.font('Helvetica')
                   .text(`Rol:`, 50, doc.y + 5)
                   .font('Helvetica-Bold')
                   .text(trabajador.rol_en_empresa, 150, doc.y - 12);

                doc.font('Helvetica')
                   .text(`Fecha inicio:`, 50, doc.y + 5)
                   .font('Helvetica-Bold')
                   .text(formatearFecha(trabajador.fecha_inicio), 150, doc.y - 12);

                doc.moveDown(1.5);
                agregarLineaHorizontal(doc.y);
                doc.moveDown();

                // === TURNO ANTERIOR ===
                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .fillColor('#e74c3c')
                   .text('TURNO ANTERIOR', 50, doc.y);

                doc.moveDown(0.5);

                doc.fontSize(10)
                   .font('Helvetica')
                   .fillColor('#34495e');

                doc.text(`Nombre del turno:`, 50, doc.y)
                   .font('Helvetica-Bold')
                   .text(tipoTurnoAnterior.nombre || 'No especificado', 150, doc.y - 12);

                doc.font('Helvetica')
                   .text(`Horario:`, 50, doc.y + 5)
                   .font('Helvetica-Bold')
                   .text(`${tipoTurnoAnterior.hora_inicio} - ${tipoTurnoAnterior.hora_fin}`, 150, doc.y - 12);

                doc.font('Helvetica')
                   .text(`Colación:`, 50, doc.y + 5)
                   .font('Helvetica-Bold')
                   .text(`${tipoTurnoAnterior.colacion_inicio} - ${tipoTurnoAnterior.colacion_fin}`, 150, doc.y - 12);

                doc.font('Helvetica')
                   .text(`Días trabajo:`, 50, doc.y + 5)
                   .font('Helvetica-Bold')
                   .text(`${tipoTurnoAnterior.dias_trabajo} días`, 150, doc.y - 12);

                doc.font('Helvetica')
                   .text(`Días descanso:`, 50, doc.y + 5)
                   .font('Helvetica-Bold')
                   .text(`${tipoTurnoAnterior.dias_descanso} días`, 150, doc.y - 12);

                if (tipoTurnoAnterior.descripcion) {
                    doc.font('Helvetica')
                       .text(`Descripción:`, 50, doc.y + 5)
                       .font('Helvetica-Bold')
                       .text(tipoTurnoAnterior.descripcion, 150, doc.y - 12);
                }

                doc.moveDown(1.5);
                agregarLineaHorizontal(doc.y);
                doc.moveDown();

                // === NUEVO TURNO ===
                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .fillColor('#27ae60')
                   .text('NUEVO TURNO', 50, doc.y);

                doc.moveDown(0.5);

                doc.fontSize(10)
                   .font('Helvetica')
                   .fillColor('#34495e');

                doc.text(`Nombre del turno:`, 50, doc.y)
                   .font('Helvetica-Bold')
                   .text(nuevoTipoTurno.nombre || 'No especificado', 150, doc.y - 12);

                doc.font('Helvetica')
                   .text(`Horario:`, 50, doc.y + 5)
                   .font('Helvetica-Bold')
                   .text(`${nuevoTipoTurno.hora_inicio} - ${nuevoTipoTurno.hora_fin}`, 150, doc.y - 12);

                doc.font('Helvetica')
                   .text(`Colación:`, 50, doc.y + 5)
                   .font('Helvetica-Bold')
                   .text(`${nuevoTipoTurno.colacion_inicio} - ${nuevoTipoTurno.colacion_fin}`, 150, doc.y - 12);

                doc.font('Helvetica')
                   .text(`Días trabajo:`, 50, doc.y + 5)
                   .font('Helvetica-Bold')
                   .text(`${nuevoTipoTurno.dias_trabajo} días`, 150, doc.y - 12);

                doc.font('Helvetica')
                   .text(`Días descanso:`, 50, doc.y + 5)
                   .font('Helvetica-Bold')
                   .text(`${nuevoTipoTurno.dias_descanso} días`, 150, doc.y - 12);

                if (nuevoTipoTurno.descripcion) {
                    doc.font('Helvetica')
                       .text(`Descripción:`, 50, doc.y + 5)
                       .font('Helvetica-Bold')
                       .text(nuevoTipoTurno.descripcion, 150, doc.y - 12);
                }

                // Verificar si necesitamos una nueva página para las firmas
                if (doc.y > 650) {
                    doc.addPage();
                }

                doc.moveDown(2);
                agregarLineaHorizontal(doc.y);
                doc.moveDown(2);

                // === FIRMAS ===
                const firmaY = doc.y;
                
                // Firma del empleador
                doc.fontSize(10)
                   .font('Helvetica')
                   .fillColor('#34495e');

                doc.text('_________________________', 80, firmaY);
                doc.text('Firma Empleador/Representante', 80, firmaY + 20, { width: 150, align: 'center' });
                doc.text(`Fecha: ${formatearFecha(new Date())}`, 80, firmaY + 40, { width: 150, align: 'center' });

                // Firma del trabajador
                doc.text('_________________________', 350, firmaY);
                doc.text('Firma Trabajador', 350, firmaY + 20, { width: 150, align: 'center' });
                doc.text('(Acepto el cambio de turno)', 350, firmaY + 35, { width: 150, align: 'center', fontSize: 8 });

                // === PIE DE PÁGINA ===
                doc.fontSize(8)
                   .fillColor('#95a5a6')
                   .text(
                       `Documento generado el ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL')} | Sistema de Control de Asistencia`,
                       50,
                       730,
                       { align: 'center', width: 512 }
                   );

                // Finalizar el documento
                doc.end();

            } catch (error) {
                reject(error);
            }
        });
            }
}

export default new PDFService();
