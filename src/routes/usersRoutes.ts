// src/routes/remindersRoutes.ts
import { Router } from 'express';
import { createUser } from '../controllers/usersController';

const router = Router();

router.post('/', createUser);

export default router;
