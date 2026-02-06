import express from 'express';
import { getPulseFeed } from '../controllers/discoveryController';

const router = express.Router();

router.get('/pulse', getPulseFeed);

export default router;
