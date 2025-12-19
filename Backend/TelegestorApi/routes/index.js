import asistenciaRoutes from './asistenciaRoutes.js';

class RouterIndex {
    constructor(app) {
        this.app = app;
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.app.use('/telegestorapi/asistencia', asistenciaRoutes);
    }
}


const routerIndex = (app) => new RouterIndex(app);
export default routerIndex;
