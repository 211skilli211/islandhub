import { Router } from 'express';
import { sitewideSearch } from '../controllers/searchController';

const router = Router();

// Public search
router.get('/', sitewideSearch);

export default router;
