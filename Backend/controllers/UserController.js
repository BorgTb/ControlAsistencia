import UserModel from '../model/UserModel.js';
import authservice from '../services/authservice.js';
import {DateTime} from 'luxon';
import ReportesModel from '../model/ReportesModel.js';
import UsuarioEmpresaModel from '../model/UsuarioEmpresaModel.js';


const updateEmail = async (req, res) => {
    const { newEmail, password } = req.body; // nuevos datos
    const user  = req.user;
    
   
    const valid = await authservice.isPasswordCorrect(user.id, password);
  
    if (!valid) {
        return res.status(400).json({
            message: 'Contraseña incorrecta',
        });
    }

    // Verificar si el nuevo email ya está en uso
    const existingUser = await UserModel.findByEmail(newEmail);
    if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({
            message: 'El email ya está en uso por otro usuario',
        });
    }

    // Actualizar el email del usuario
    await UserModel.update(user.id, { email: newEmail });

    const newUser = await UserModel.findByEmail(newEmail);
   
    res.status(200).json({
        message: 'Email actualizado correctamente',
        success: true,
        user: {
            id: newUser.id,
            nombre: newUser.nombre,
            email: newUser.email,
            rol: newUser.rol,
            rut: newUser.rut,
            estado: newUser.estado
        }
    });
}

const updatePassword = async (req, res) => {
    const { newPassword, currentPassword } = req.body; // nuevos datos
    const user = req.user;

    const valid = await authservice.isPasswordCorrect(user.id, currentPassword);
  
    if (!valid) {
        return res.status(400).json({
            message: 'Contraseña actual incorrecta',
        });
    }


    // Actualizar la contraseña del usuario
    await authservice.updateUserPassword(user.id, newPassword);

    res.status(200).json({
        message: 'Contraseña actualizada correctamente',
        success: true
    });
}

const createReporte = async (req, res) => {
    const reporteData = req.body;
    const user = req.user;
    try {
        // Aquí iría la lógica para guardar el reporte en la base de datos
        const nuevoReporte = {
            marcacion_id: reporteData.marcacion_id,
            usuario_id: await UsuarioEmpresaModel.obtenerEmpresaIdByUsuarioId(user.id),
            tipo_problema: reporteData.tipo_problema,
            descripcion: reporteData.descripcion,
            fecha_correcta: reporteData.fecha_correcta,
            hora_correcta: reporteData.hora_correcta,
            fecha_creacion: DateTime.now().setZone('America/Santiago').toISO()
        };

        // Guardar el reporte en la base de datos
        const reporteGuardado = await ReportesModel.create(nuevoReporte);
        res.status(201).json({
            success: true,
            message: 'Reporte enviado correctamente',
            data: reporteGuardado
        });
    } catch (error) {
        console.error('Error al crear el reporte:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar el reporte'
        });
    }
}




/**
 * Crea un usuario administrador.
 * Este endpoint permite registrar un nuevo usuario con el rol 'admin'.
 * Es útil para gestionar el acceso administrativo desde el backend.
 */
const createAdmin = async (req, res) => {
    try {
        const { nombre, apellido_pat, apellido_mat, email, password, rut, estado } = req.body;
        // El campo 'rol' se fuerza a 'admin' para asegurar el tipo de usuario
        const data = { nombre, apellido_pat, apellido_mat, email, password, rol: 'admin', rut, estado };
        const id = await UserModel.create(data);
        res.status(201).json({ success: true, id });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear administrador', error });
    }
}

/**
 * Lista todos los usuarios con rol 'admin'.
 * Este endpoint permite obtener todos los administradores registrados en el sistema.
 * Útil para paneles de gestión y auditoría.
 */
const listAdmins = async (req, res) => {
    try {
        const admins = await UserModel.findAllAdmins();
        res.status(200).json({ success: true, admins });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al listar administradores', error });
    }
}

const UserController = {
    updateEmail,
    updatePassword,
    createReporte,
    createAdmin,
    listAdmins
}


export default UserController;