import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface AuthRequest {
  email: string;
  password: string;
}

export class AuthenticateUserService {
  async execute({ email, password }: AuthRequest) {
    // 1. Verifica se o e-mail existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("E-mail ou senha incorretos.");
    }

    // 2. Verifica se a senha bate com o hash do banco
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      throw new Error("E-mail ou senha incorretos.");
    }

    // 3. Gera o token JWT
    // Pega a variável de ambiente ou usa um fallback genérico
    const secret = process.env.JWT_SECRET || "default_secret";

    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
      },
      secret,
      {
        subject: user.id, // O "dono" do token é o ID do usuário
        expiresIn: "1d", // O token expira em 1 dia
      },
    );

    // 4. Retorna as informações do usuário (sem a senha) e o token
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }
}
