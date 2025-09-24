// src/routes/remindersRoutes.ts
import { Router } from 'express';
import {
  createReminder,
  getReminders,
} from '../controllers/remindersController'; // Importa a função do controller

const router = Router();

router.post('/reminders', createReminder);
router.get('/', getReminders);

export default router;
