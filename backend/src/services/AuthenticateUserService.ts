import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface AuthRequest {
  email: string;
  password: string;
}

export class AuthenticateUserService {
  async execute({ email, password }: AuthRequest) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("E-mail ou senha incorretos.");
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      throw new Error("E-mail ou senha incorretos.");
    }

    const secret = process.env.JWT_SECRET || "default_secret";

    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
      },
      secret,
      {
        subject: user.id,
        expiresIn: "1d",
      },
    );

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
