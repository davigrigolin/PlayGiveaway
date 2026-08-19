import { Request, Response } from "express";
import { CreateRaffleService } from "../services/CreateRaffleService";
import { ListRafflesService } from "../services/ListRafflesService";
import { ShowRaffleService } from "../services/ShowRaffleService";
import { createRaffleSchema } from "../schemas/raffleSchema";
import { DrawRaffleService } from "../services/DrawRaffleService";
import { DeleteRaffleService } from "../services/DeleteRaffleService";
import { ShowRaffleDetailsService } from "../services/ShowRaffleDetailsService";
import { CloseRaffleService } from "../services/CloseRaffleService";

export class RaffleController {
  async create(req: Request, res: Response) {
    try {
      const { title, description } = createRaffleSchema.parse(req.body);
      const user_id = req.user.id;

      const createRaffleService = new CreateRaffleService();
      const raffle = await createRaffleService.execute({
        title,
        description,
        user_id,
      });

      res.status(201).json(raffle);
    } catch (error: any) {
      res
        .status(400)
        .json({ error: error.message || "Erro ao criar o sorteio." });
    }
  }

  async index(req: Request, res: Response) {
    try {
      const user_id = req.user.id;

      const listRafflesService = new ListRafflesService();
      const raffles = await listRafflesService.execute(user_id);

      res.json(raffles);
    } catch (error: any) {
      res.status(400).json({ error: "Erro ao buscar os sorteios." });
    }
  }
  async show(req: Request, res: Response) {
    try {
      const slug = req.params.slug as string;

      const showRaffleService = new ShowRaffleService();
      const raffle = await showRaffleService.execute({ slug });

      res.json(raffle);
    } catch (error: any) {
      res
        .status(404)
        .json({ error: error.message || "Sorteio não encontrado." });
    }
  }
  async draw(req: Request, res: Response) {
    try {
      const raffle_id = req.params.id as string;
      const user_id = req.user.id;
      const quantity = Number(req.body?.quantity ?? 1);

      const drawRaffleService = new DrawRaffleService();
      const result = await drawRaffleService.execute({
        raffle_id,
        user_id,
        quantity,
      });

      res.json(result);
    } catch (error: any) {
      res
        .status(400)
        .json({ error: error.message || "Erro ao realizar o sorteio." });
    }
  }

  async close(req: Request, res: Response) {
    try {
      const raffle_id = req.params.id as string;
      const user_id = req.user.id;

      const closeRaffleService = new CloseRaffleService();
      const result = await closeRaffleService.execute({
        raffle_id,
        user_id,
      });

      res.json(result);
    } catch (error: any) {
      res
        .status(400)
        .json({ error: error.message || "Erro ao encerrar as inscrições." });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const raffle_id = req.params.id as string;
      const user_id = req.user.id;

      await new DeleteRaffleService().execute({ raffle_id, user_id });
      res.status(204).send();
    } catch (error: any) {
      res
        .status(400)
        .json({ error: error.message || "Erro ao excluir o sorteio." });
    }
  }

  async details(req: Request, res: Response) {
    try {
      const raffle_id = req.params.id as string;
      const user_id = req.user.id;
      const raffle = await new ShowRaffleDetailsService().execute({
        raffle_id,
        user_id,
      });

      res.json(raffle);
    } catch (error: any) {
      res
        .status(400)
        .json({ error: error.message || "Erro ao buscar o sorteio." });
    }
  }
}
