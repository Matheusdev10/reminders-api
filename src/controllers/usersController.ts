import { Request, Response } from 'express';
import { hash } from 'bcryptjs';
import prisma from '../models/prisma';
import { z } from 'zod';

// interface CreateUserRequestBody {
//   name: string;
//   email: string;
//   password: string;
// }

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

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Nome, e-mail e senha são obrigatórios.',
      });
    }

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return res.status(409).json({ message: 'Este e-mail já está em uso.' });
    }

    const hashedPassword = await hash(password, 8);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Erro de validação.',
        issues: error.issues,
      });
    }
    console.error('Falha ao criar usuário:', error);
    return res.status(500).json({ message: 'Erro interno ao criar usuário.' });
  }
};
