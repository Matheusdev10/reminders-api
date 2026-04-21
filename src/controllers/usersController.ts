import { Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../errors/AppError';
import { createUserService } from '../services/createUserService';

const createUserBodySchema = z.object({
  name: z
    .string()
    .min(3, { message: 'O nome precisa ter no mínimo 3 caracteres.' }),
  email: z.email({ message: 'Formato de e-mail inválido.' }),
  password: z
    .string()
    .min(6, { message: 'A senha precisa ter no mínimo 6 caracteres.' }),
});

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = createUserBodySchema.parse(req.body);
    const userWithoutPassword = await createUserService({
      name,
      email,
      password,
    });

    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Erro de validação.',
        issues: error.issues,
      });
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error('Falha ao criar usuário:', error);
    return res.status(500).json({ message: 'Erro interno ao criar usuário.' });
  }
};
