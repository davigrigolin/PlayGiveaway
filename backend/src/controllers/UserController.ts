import { Request, Response } from "express";
import { CreateUserService } from "../services/CreateUserService";
import { createUserSchema } from "../schemas/userSchema";

export class UserController {
  async create(req: Request, res: Response) {
    const { name, email, password } = createUserSchema.parse(req.body);

    const createUserService = new CreateUserService();
    const user = await createUserService.execute({ name, email, password });

    res.status(201).json(user);
  }
}
