// routes/statsRoutes.js
import express from 'express';
import { getPublicStats, getPublicSummary } from '../controllers/statsController.js';

const statsRouter = express.Router();

// Public routes - no authentication required
statsRouter.get('/public', getPublicStats);
statsRouter.get('/public/summary', getPublicSummary);

export default statsRouter;