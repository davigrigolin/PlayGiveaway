import { prisma } from "../lib/prisma";

interface ShowRaffleDetailsRequest {
  raffle_id: string;
  user_id: string;
}

export class ShowRaffleDetailsService {
  async execute({ raffle_id, user_id }: ShowRaffleDetailsRequest) {
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffle_id },
      include: {
        participants: {
          orderBy: { created_at: "desc" },
          select: { id: true, name: true, email: true, created_at: true },
        },
      },
    });

    if (!raffle) {
      throw new Error("Sorteio não encontrado.");
    }

    if (raffle.user_id !== user_id) {
      throw new Error("Você não tem permissão para acessar este sorteio.");
    }

    return raffle;
  }
}
