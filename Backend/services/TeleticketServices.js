import TeleticketModel from "../model/TeleticketModel.js";

class TeleticketServices {
    async validarExistenciaUsuarioEmpresa(email) {
        const usuario = await TeleticketModel.getUsuarioEmpresa(email);
        return usuario !== null;
    }
}

export default new TeleticketServices();
