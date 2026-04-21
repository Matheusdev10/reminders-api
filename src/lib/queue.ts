// src/lib/queue.ts

import { redisConfig } from '../configs/redis';
import { Queue } from 'bullmq';

// Configura a conexão com o Redis

// Cria e exporta a fila de lembretes
export const reminderQueue = new Queue('reminders', {
  connection: redisConfig,
});
