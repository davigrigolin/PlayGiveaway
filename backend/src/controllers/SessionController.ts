import { Request, Response } from "express";
import { AuthenticateUserService } from "../services/AuthenticateUserService";
import { loginSchema } from "../schemas/loginSchema";

export class SessionController {
  async create(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const authenticateUser = new AuthenticateUserService();
      const authData = await authenticateUser.execute({ email, password });

      res.json(authData);
    } catch (error: any) {
      res
        .status(401)
        .json({ error: error.message || "Falha na autenticação." });
    }
  }
}
