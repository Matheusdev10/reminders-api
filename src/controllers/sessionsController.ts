import { Request, Response } from 'express';

import { z } from 'zod';
import { AppError } from '../errors/AppError';
import { createSessionService } from '../services/createSessionService';

const createSessionBodySchema = z.object({
  email: z.email({ message: 'Formato de e-mail inválido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

export const sessionsController = async (req: Request, res: Response) => {
  try {
    const { email, password } = createSessionBodySchema.parse(req.body);
    const { user, token } = await createSessionService({ email, password });

    return res.status(200).json({ user, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Erro de validação.', issues: error.issues });
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error('Erro na autenticação:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
