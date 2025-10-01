import { Router } from 'express';
import { sessionsController } from '../controllers/sessionsController';

const router = Router();

router.post('/', sessionsController);

export default router;
