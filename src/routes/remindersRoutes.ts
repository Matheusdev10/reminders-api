import { Router } from 'express';
import {
  createReminder,
  getReminders,
  deleteReminder,
  patchReminder,
  getReminderById,
} from '../controllers/remindersController';
import { authMiddleware } from '@/middleware/authMiddleware';

const router = Router();

router.post('/', authMiddleware, createReminder);
router.delete('/:id', authMiddleware, deleteReminder);
router.patch('/:id', authMiddleware, patchReminder);
router.get('/', authMiddleware, getReminders);
router.get('/:id', authMiddleware, getReminderById);

export default router;
