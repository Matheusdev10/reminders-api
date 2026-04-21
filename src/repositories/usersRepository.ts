import prisma from '../models/prisma';

type CreateUserData = {
  name: string;
  email: string;
  password: string;
};

export const usersRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  create(data: CreateUserData) {
    return prisma.user.create({ data });
  },
};
