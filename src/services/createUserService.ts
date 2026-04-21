import { hash } from 'bcryptjs';
import { AppError } from '../errors/AppError';
import { usersRepository } from '../repositories/usersRepository';

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
};

export async function createUserService({
  name,
  email,
  password,
}: CreateUserInput) {
  const userExists = await usersRepository.findByEmail(email);

  if (userExists) {
    throw new AppError('Este e-mail já está em uso.', 409);
  }

  const hashedPassword = await hash(password, 8);

  const user = await usersRepository.create({
    name,
    email,
    password: hashedPassword,
  });

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
