import pool from '../config/teletickets.js'


class TeleticketModel{
    constructor() {
        if (!TeleticketModel.instance) {
            TeleticketModel.instance = this;
        }
        return TeleticketModel.instance;
    }

    async getUsuarioEmpresa(email = null){
        if (!email) {
            throw new Error('Email is required');
        }

        const [rows] = await pool.query('SELECT * FROM app_user WHERE email = ? ', [email]);
        return rows[0] || null;
    }
};



export default new TeleticketModel();