import { Request, Response } from 'express';
import { ReminderStatus } from '@prisma/client';

import { z } from 'zod';
import { AppError } from '../errors/AppError';
import {
  createReminderService,
  deleteReminderService,
  getReminderByIdService,
  listRemindersService,
  patchReminderService,
} from '../services/remindersService';

const isoDateTimeWithTimezoneSchema = z
  .string()
  .refine(
    (value) => {
      const isoWithTimezonePattern =
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;
      if (!isoWithTimezonePattern.test(value)) {
        return false;
      }

      const parsedDate = new Date(value);
      return !isNaN(parsedDate.getTime());
    },
    {
      message:
        'notificationDate deve estar em ISO 8601 com fuso. Ex: 2026-06-04T00:00:00-03:00',
    }
  )
  .transform((value) => new Date(value));

const createReminderBodySchema = z.object({
  message: z.string().min(3),
  notificationDate: isoDateTimeWithTimezoneSchema.refine(
    (date) => date > new Date(),
    {
      message: 'A data do lembrete deve ser uma data no futuro.',
    }
  ),
});
const reminderParamsSchema = z.object({
  id: z.cuid({ message: 'ID do lembrete inválido.' }),
});
const patchReminderBodySchema = createReminderBodySchema.partial();
const listRemindersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(ReminderStatus).optional(),
});

export const createReminder = async (req: Request, res: Response) => {
  try {
    const { message, notificationDate } = createReminderBodySchema.parse(
      req.body
    );
    const userId = req.user.id;
    const newReminder = await createReminderService({
      message,
      notificationDate,
      userId,
    });

    return res.status(201).json(newReminder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Erro de validação.', issues: error.issues });
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error('Erro ao criar um lembrete:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const getReminders = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { page, limit, status } = listRemindersQuerySchema.parse(req.query);

    const result = await listRemindersService({
      userId,
      page,
      limit,
      status,
    });

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Erro de validação.', issues: error.issues });
    }

    console.error('Erro ao buscar lembretes:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const deleteReminder = async (req: Request, res: Response) => {
  try {
    const { id } = reminderParamsSchema.parse(req.params);
    const userId = req.user.id;

    await deleteReminderService({ id, userId });

    return res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Erro de validação.', issues: error.issues });
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error('Falha ao deletar lembrete:', error);
    return res.status(500).json({ message: 'Erro ao deletar o lembrete.' });
  }
};

export const patchReminder = async (req: Request, res: Response) => {
  try {
    const { id } = reminderParamsSchema.parse(req.params);
    const userId = req.user.id;

    const dataToUpdate = patchReminderBodySchema.parse(req.body);

    if (Object.keys(dataToUpdate).length === 0) {
      throw new AppError('Nenhum dado fornecido para atualização.', 400);
    }

    await patchReminderService({ id, userId, ...dataToUpdate });

    return res.status(200).json({ message: 'Lembrete atualizado com sucesso' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Erro de validação.', issues: error.issues });
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error('Falha ao tentar atualizar um lembrete', error);
    return res.status(500).json({ message: 'Erro ao atualizar o lembrete.' });
  }
};

export const getReminderById = async (req: Request, res: Response) => {
  try {
    const { id } = reminderParamsSchema.parse(req.params);
    const userId = req.user.id;

    const reminder = await getReminderByIdService(id, userId);

    return res.status(200).json(reminder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Erro de validação.', issues: error.issues });
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error('Erro ao buscar um lembrete:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
