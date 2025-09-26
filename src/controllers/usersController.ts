import { Request, Response } from 'express';
import { hash } from 'bcryptjs';
import prisma from '../models/prisma';

interface CreateUserRequestBody {
  name: string;
  email: string;
  password: string;
}

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as CreateUserRequestBody;

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
    console.error('Falha ao criar usuário:', error);
    return res.status(500).json({ message: 'Erro interno ao criar usuário.' });
  }
};
