import { Router } from 'express';
import { categoryController } from '../controllers/categoryController';

const router = Router();

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/subtypes/:id/form-config', categoryController.getFormConfig);
router.get('/:key', categoryController.getCategoryByKey);
router.get('/:key/subtypes', categoryController.getSubtypes);

export default router;
