import { prisma } from "../lib/prisma";
import crypto from "crypto";

interface CreateRaffleRequest {
  title: string;
  description?: string;
  user_id: string;
}

export class CreateRaffleService {
  async execute({ title, description, user_id }: CreateRaffleRequest) {
    // 1. Gera um slug base a partir do título (tira acentos, espaços viram hífen)
    const baseSlug = title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // 2. Adiciona um código aleatório curto no final para garantir que o slug nunca se repita no banco
    const uniqueSuffix = crypto.randomBytes(3).toString("hex");
    const slug = `${baseSlug}-${uniqueSuffix}`;

    // 3. Salva no banco de dados com a sua estrutura exata
    const raffle = await prisma.raffle.create({
      data: {
        title,
        description,
        slug,
        user_id,
        // status e winner_id não precisamos mandar, o Prisma usa o default ou deixa nulo
      },
    });

    return raffle;
  }
}
