// src/controllers/remindersController.ts

import { Request, Response } from 'express';
import prisma from '../models/prisma'; // Assumindo que prisma está em '../models/prisma'
import { reminderQueue } from '../lib/queue'; // <-- Vamos criar este arquivo

// 1. Interface para o que o CLIENTE ENVIA no corpo da requisição POST
interface CreateReminderRequestBody {
  message: string;
  notificationDate: string; // O cliente envia como string (ex: "2023-10-27T10:00:00Z")
}

// 2. Interface para o que o BACKEND RETORNA
//    (Opcional, mas boa prática para clareza e reuso)
//    Você pode usar diretamente o tipo gerado pelo Prisma também: Prisma.ReminderGetPayload

export const createReminder = async (req: Request, res: Response) => {
  try {
    // Tipando especificamente o req.body
    const { message, notificationDate } = req.body as CreateReminderRequestBody;

    // Validação dos campos obrigatórios
    if (!message || !notificationDate) {
      return res.status(400).json({
        message: 'Mensagem e data/hora de notificação são obrigatórios.',
      });
    }

    // Convertendo a string da data para um objeto Date antes de salvar no banco
    const parsedNotificationDate = new Date(notificationDate);
    if (isNaN(parsedNotificationDate.getTime())) {
      // Verifica se a data é inválida
      return res
        .status(400)
        .json({ message: 'Formato de data/hora de notificação inválido.' });
    }

    const newReminder = await prisma.reminder.create({
      data: {
        message,
        notificationDate: parsedNotificationDate,
      },
    });

    const delay = parsedNotificationDate.getTime() - new Date().getTime();
    console.log(`Agendando job com ${delay / 1000}s de atraso.`);
    await reminderQueue.add(
      'send-notification', // Nome do job
      { reminderId: newReminder.id }, // Dados que o worker vai receber (apenas o ID!)
      { delay: delay > 0 ? delay : 0 } // Opções do job (delay)
    );

    // Retorna o novo lembrete criado.
    // É comum retornar uma representação JSON do objeto criado.
    return res.status(201).json(newReminder); // Prisma já retorna um objeto JS compatível
  } catch (error) {
    console.error('Erro ao criar um lembrete:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const getReminders = async (req: Request, res: Response) => {
  try {
    const reminders = await prisma.reminder.findMany();
    return res.status(200).json(reminders);
  } catch (error) {
    console.error('Erro ao buscar lembretes:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
