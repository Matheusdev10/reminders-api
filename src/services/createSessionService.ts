import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { auth } from '../configs/auth';
import { AppError } from '../errors/AppError';
import { usersRepository } from '../repositories/usersRepository';

type CreateSessionInput = {
  email: string;
  password: string;
};

export async function createSessionService({
  email,
  password,
}: CreateSessionInput) {
  const user = await usersRepository.findByEmail(email);

  if (!user) {
    throw new AppError('E-mail e/ou senha incorretos', 401);
  }

  const passwordMatched = await compare(password, user.password);

  if (!passwordMatched) {
    throw new AppError('E-mail e/ou senha incorretos', 401);
  }

  const { secret, expiresIn } = auth.jwt;

  if (!secret) {
    throw new AppError('Configuração JWT inválida', 500);
  }

  const token = sign(
    {
      nome: user.name,
      email: user.email,
    },
    secret,
    {
      subject: user.id,
      expiresIn,
    }
  );

  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
}
