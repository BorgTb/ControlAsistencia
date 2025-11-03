import express from 'express';
import FeriadosController from '../controllers/FeriadosController.js';

const router = express.Router();

router.get('/', FeriadosController.list);
router.get('/:id', FeriadosController.getOne);
router.post('/', FeriadosController.create);
router.put('/:id', FeriadosController.update);
router.delete('/:id', FeriadosController.remove);

export default router;
