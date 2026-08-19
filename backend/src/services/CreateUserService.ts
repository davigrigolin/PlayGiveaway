import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

// Tipagem dos dados que o serviço vai receber
interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export class CreateUserService {
  async execute({ name, email, password }: CreateUserRequest) {
    // 1. Verifica se o e-mail já existe no banco
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new Error("Este e-mail já está em uso.");
    }

    // 2. Cria o hash seguro da senha
    const password_hash = await bcrypt.hash(password, 8);

    // 3. Salva o usuário no banco de dados
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
      },
      // select define o que queremos retornar (nunca devolvemos a senha!)
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
