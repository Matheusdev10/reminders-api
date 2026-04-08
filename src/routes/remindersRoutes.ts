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

/**
 * @openapi
 * /api/reminders:
 *   post:
 *     tags: [Reminders]
 *     summary: Cria um lembrete para o usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message, notificationDate]
 *             properties:
 *               message:
 *                 type: string
 *                 example: Reuniao com time
 *               notificationDate:
 *                 type: string
 *                 format: date-time
 *                 description: ISO 8601 com fuso explicito (Z ou ±HH:MM)
 *                 example: 2026-12-01T11:00:00-03:00
 *     responses:
 *       201:
 *         description: Lembrete criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reminder'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   get:
 *     tags: [Reminders]
 *     summary: Lista os lembretes do usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de lembretes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reminder'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', authMiddleware, createReminder);
router.get('/', authMiddleware, getReminders);

/**
 * @openapi
 * /api/reminders/{id}:
 *   get:
 *     tags: [Reminders]
 *     summary: Busca um lembrete por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lembrete encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reminder'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   patch:
 *     tags: [Reminders]
 *     summary: Atualiza parcialmente um lembrete
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Estudar Swagger
 *               notificationDate:
 *                 type: string
 *                 format: date-time
 *                 description: ISO 8601 com fuso explicito (Z ou ±HH:MM)
 *                 example: 2026-12-01T12:00:00-03:00
 *     responses:
 *       200:
 *         description: Lembrete atualizado com sucesso
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     tags: [Reminders]
 *     summary: Remove um lembrete
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Lembrete removido com sucesso
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id', authMiddleware, patchReminder);
router.get('/:id', authMiddleware, getReminderById);
router.delete('/:id', authMiddleware, deleteReminder);

export default router;
