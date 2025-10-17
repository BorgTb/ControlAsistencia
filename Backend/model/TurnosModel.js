import pool from '../config/dbconfig.js'
import { DateTime } from 'luxon';
import AsignacionTurnosModel from './AsignacionTurnosModel.js';

class TurnosModel {
    // Mantener métodos antiguos para compatibilidad
    static async getAllTurnos() {
        return await AsignacionTurnosModel.getAll();
    }

    static async getTurnoById(id) {
        return await AsignacionTurnosModel.getById(id);
    }

    static async getTurnosByUsuarioId(usuario_empresa_id) {
        return await AsignacionTurnosModel.getByUsuarioEmpresaId(usuario_empresa_id);
    }

    static async createTurno(turnoData) {
        // Compatibilidad: si viene del formato antiguo, crear asignación
        return await AsignacionTurnosModel.create(turnoData);
    }

    static async updateTurno(id, turnoData) {
        return await AsignacionTurnosModel.update(id, turnoData);
    }

    static async deleteTurno(id) {
        return await AsignacionTurnosModel.delete(id);
    }

    static async obtenerTurnoPorUsuarioYFecha(usuario_empresa_id, fecha) {
        return await AsignacionTurnosModel.getActivoByUsuarioEmpresaId(usuario_empresa_id, fecha);
    }

    static async obtenerTurnoPorUsuarioYDia(usuario_empresa_id, dia) {
        // Para nueva estructura, buscar turno activo
        return await AsignacionTurnosModel.getActivoByUsuarioEmpresaId(usuario_empresa_id);
    }
}

export default TurnosModel;