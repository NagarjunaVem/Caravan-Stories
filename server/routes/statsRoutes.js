// routes/statsRoutes.js
import express from 'express';
import { getPublicStats } from '../controllers/statsController.js';

const statsRouter = express.Router();

// Public route - no authentication required
statsRouter.get('/public', getPublicStats);

export default statsRouter;