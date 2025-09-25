// src/routes/remindersRoutes.ts
import { Router } from 'express';
import {
  createReminder,
  getReminders,
  deleteReminder,
  patchReminder,
  getReminderById,
} from '../controllers/remindersController'; // Importa a função do controller

const router = Router();

router.post('/', createReminder);
router.delete('/:id', deleteReminder);
router.patch('/:id', patchReminder);
router.get('/', getReminders);
router.get('/:id', getReminderById);

export default router;
