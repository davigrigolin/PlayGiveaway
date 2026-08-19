import { Request, Response } from "express";
import { ZodError } from "zod";
import { CreateParticipantService } from "../services/CreateParticipantService";
import { ListParticipantsService } from "../services/ListParticipantsService"; // <-- Importou o novo serviço
import { ShowRaffleService } from "../services/ShowRaffleService";
import { createParticipantSchema } from "../schemas/participantSchema";

export class ParticipantController {
  // Função de CRIAR (Inscrever participante) que já fizemos
  async create(req: Request, res: Response) {
    try {
      const raffle_id = req.params.raffle_id as string;
      const { name, email } = createParticipantSchema.parse(req.body);

      const createParticipant = new CreateParticipantService();
      const participant = await createParticipant.execute({
        raffle_id,
        name,
        email,
      });

      res.status(201).json(participant);
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: error.issues[0]?.message || "Dados de inscrição inválidos.",
        });
      }

      res
        .status(400)
        .json({ error: error.message || "Erro ao inscrever participante." });
    }
  }

  async createPublic(req: Request, res: Response) {
    try {
      const slug = req.params.slug as string;
      const { name, email } = createParticipantSchema.parse(req.body);
      const raffle = await new ShowRaffleService().execute({ slug });
      const participant = await new CreateParticipantService().execute({
        raffle_id: raffle.id,
        name,
        email,
      });

      res.status(201).json(participant);
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: error.issues[0]?.message || "Dados de inscrição inválidos.",
        });
      }

      if (error instanceof Error && error.message === "Sorteio não encontrado.") {
        return res.status(404).json({ error: error.message });
      }

      res
        .status(400)
        .json({ error: error.message || "Erro ao inscrever participante." });
    }
  }

  // NOVA Função de LISTAR
  async index(req: Request, res: Response) {
    try {
      const raffle_id = req.params.id as string; // Pega o ID do sorteio da URL
      const user_id = req.user.id; // Pega o ID do organizador que está logado

      const listParticipantsService = new ListParticipantsService();
      const participants = await listParticipantsService.execute({
        raffle_id,
        user_id,
      });

      res.json(participants);
    } catch (error: any) {
      res
        .status(400)
        .json({ error: error.message || "Erro ao buscar os participantes." });
    }
  }
}
