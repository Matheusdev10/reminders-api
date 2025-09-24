// src/routes/remindersRoutes.ts
import { Router } from 'express';
import {
  createReminder,
  getReminders,
  deleteReminder,
} from '../controllers/remindersController'; // Importa a função do controller

const router = Router();

router.post('/', createReminder);
router.delete('/:id', deleteReminder);
router.get('/', getReminders);

export default router;
