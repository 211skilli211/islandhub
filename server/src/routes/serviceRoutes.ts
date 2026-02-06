import { Router } from 'express';
import * as serviceController from '../controllers/serviceController';

const router = Router();

router.get('/', serviceController.getServicesByStore);
router.get('/:id', serviceController.getServiceDetails);

export default router;
