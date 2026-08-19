import { Request, Response } from "express";
import { CreateUserService } from "../services/CreateUserService";
import { createUserSchema } from "../schemas/userSchema";

export class UserController {
  async create(req: Request, res: Response) {
    // 1. Valida os dados que chegaram no corpo da requisição (body)
    const { name, email, password } = createUserSchema.parse(req.body);

    // 2. Chama o serviço de criação
    const createUserService = new CreateUserService();
    const user = await createUserService.execute({ name, email, password });

    // 3. Retorna o usuário criado com status 201 (Created)
    res.status(201).json(user);
  }
}
