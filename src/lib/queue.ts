// src/lib/queue.ts

import { Queue } from 'bullmq';

// Configura a conexão com o Redis
const connection = {
  host: 'localhost',
  port: 6379,
};

// Cria e exporta a fila de lembretes
export const reminderQueue = new Queue('reminders', { connection });
