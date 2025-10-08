import { Request, Response } from 'express';
import prisma from '../models/prisma';
import { reminderQueue } from '../lib/queue';

import { z } from 'zod';

const createReminderBodySchema = z.object({
  message: z.string().min(3),
  notificationDate: z.coerce.date().refine((date) => date > new Date(), {
    message: 'A data do lembrete deve ser uma data no futuro.',
  }),
});
const reminderParamsSchema = z.object({
  id: z.cuid({ message: 'ID do lembrete inválido.' }),
});
const patchReminderBodySchema = createReminderBodySchema.partial();

export const createReminder = async (req: Request, res: Response) => {
  try {
    const { message, notificationDate } = createReminderBodySchema.parse(
      req.body
    );
    const userId = req.user.id;

    if (!message || !notificationDate) {
      return res.status(400).json({
        message: 'Mensagem e data/hora de notificação são obrigatórios.',
      });
    }

    const parsedNotificationDate = new Date(notificationDate);
    console.log(parsedNotificationDate, 'parsedNotificationDate');
    if (isNaN(parsedNotificationDate.getTime())) {
      return res
        .status(400)
        .json({ message: 'Formato de data/hora de notificação inválido.' });
    }

    const newReminder = await prisma.reminder.create({
      data: {
        message,
        notificationDate: parsedNotificationDate,
        userId,
      },
    });

    const delay = parsedNotificationDate.getTime() - new Date().getTime();
    console.log(`Agendando job com ${delay / 1000}s de atraso.`);
    await reminderQueue.add(
      'send-notification',
      { reminderId: newReminder.id },
      { delay: delay > 0 ? delay : 0 }
    );

    return res.status(201).json(newReminder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Erro de validação.', issues: error.issues });
    }
    console.error('Erro ao criar um lembrete:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const getReminders = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const reminders = await prisma.reminder.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return res.status(200).json(reminders);
  } catch (error) {
    console.error('Erro ao buscar lembretes:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const deleteReminder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await prisma.reminder.deleteMany({
      where: {
        id: id,
        userId: userId,
      },
    });
    if (result.count === 0) {
      return res.status(404).json({
        message:
          'Lembrete não encontrado ou você não tem permissão para deletá-lo.',
      });
    }
    return res.status(204).send();
  } catch (error) {
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
      return res
        .status(400)
        .json({ message: 'Nenhum dado fornecido para atualização.' });
    }

    const result = await prisma.reminder.updateMany({
      where: {
        id: id,
        userId: userId,
      },
      data: dataToUpdate,
    });

    if (result.count === 0) {
      return res.status(404).json({
        message:
          'Lembrete não encontrado ou você não tem permissão para editá-lo.',
      });
    }

    return res.status(200).json({ message: 'Lembrete atualizado com sucesso' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Erro de validação.', issues: error.format() });
    }
    console.error('Falha ao tentar atualizar um lembrete', error);
    return res.status(500).json({ message: 'Erro ao atualizar o lembrete.' });
  }
};

export const getReminderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const reminder = await prisma.reminder.findFirst({
      where: {
        id,
        userId,
      },
    });
    if (!reminder) {
      return res.status(404).json({ message: 'Lembrete não encontrado.' });
    }
    return res.status(200).json(reminder);
  } catch (error) {
    console.error('Erro ao buscar um lembrete:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

//obervação: tanto no metodo delete quanto no metodo update eu estou agora verificando
// se o userId pertence aquele lembrete em especifico. Isso permite que ele atualiza ou delete
// apenas o lembrete que pertence a ele. Antes usavamos o metodo update ou delete
// esse metodo é exigente ele espera que a clausula where aponte para um campo que seja unico
// porem userId não é unico e portanto usamos o deleteMany e updateMany porque ele deleta ou atualiza
//usando criterios mais gerais ou multiplos filtros que não necessariamente são unicos
// deleteMany ou updateMany não significa que ele vai deletar ou atualizar multiplos lembretes
// ele apenas filtra por campos que podem ser que não sejam únicos.
// O mesmo acontece com o findUnique
//findUnique (O Especialista): Como vimos, ele é muito restrito e
// só funciona quando você busca por um único campo que seja @id ou @unique
// no seu schema. Ele não aceita a combinação de id e userId.
//findFirst (O Flexível): É o método perfeito para este caso. Ele:
//Aceita uma cláusula where com quantas condições você quiser (id, userId, status, etc.).
//Busca no banco e retorna o primeiro registro que encontrar que satisfaça todas essas condições.
//Se não encontrar nada, ele retorna null (exatamente como o findUnique).
