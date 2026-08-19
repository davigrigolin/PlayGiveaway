import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export class CreateUserService {
  async execute({ name, email, password }: CreateUserRequest) {
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new Error("Este e-mail já está em uso.");
    }

    const password_hash = await bcrypt.hash(password, 8);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
      },
    });

    return user;
  }
}
