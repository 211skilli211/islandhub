import { Router } from 'express';
import { getCoops, getCoopSectors, getCoopBySlug, getIBTServices, submitServiceInquiry } from '../controllers/ibtController';

const router = Router();

// Coops
router.get('/coops', getCoops);
router.get('/coops/sectors', getCoopSectors);
router.get('/coops/:slug', getCoopBySlug);

// IBT Services
router.get('/services', getIBTServices);

// Service inquiry
router.post('/inquiry', submitServiceInquiry);

export default router;
