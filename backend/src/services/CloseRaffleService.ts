import { prisma } from "../lib/prisma";

interface CloseRaffleRequest {
  raffle_id: string;
  user_id: string;
}

export class CloseRaffleService {
  async execute({ raffle_id, user_id }: CloseRaffleRequest) {
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffle_id },
    });

    if (!raffle) {
      throw new Error("Sorteio não encontrado.");
    }

    if (raffle.user_id !== user_id) {
      throw new Error("Você não tem permissão para fechar este sorteio.");
    }

    if (raffle.status === "DRAWN") {
      throw new Error("Este sorteio já foi realizado.");
    }

    if (raffle.status === "CLOSED") {
      throw new Error("Este sorteio já está encerrado.");
    }

    const { count } = await prisma.raffle.updateMany({
      where: {
        id: raffle_id,
        status: "OPEN",
      },
      data: {
        status: "CLOSED",
      },
    });

    if (count === 0) {
      throw new Error("Não foi possível encerrar as inscrições neste momento.");
    }

    return {
      message: "Inscrições encerradas com sucesso.",
    };
  }
}
