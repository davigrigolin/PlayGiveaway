import { prisma } from "../lib/prisma";

interface ListParticipantsRequest {
  raffle_id: string;
  user_id: string;
}

export class ListParticipantsService {
  async execute({ raffle_id, user_id }: ListParticipantsRequest) {
    // 1. Busca o sorteio e seus participantes
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffle_id },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            created_at: true,
          },
          orderBy: {
            created_at: "desc", // Mostra os inscritos mais recentes primeiro
          },
        },
      },
    });

    if (!raffle) {
      throw new Error("Sorteio não encontrado.");
    }

    // 2. Segurança: Garante que apenas o dono do sorteio pode ver a lista de inscritos
    if (raffle.user_id !== user_id) {
      throw new Error(
        "Você não tem permissão para ver os participantes deste sorteio.",
      );
    }

    return raffle.participants;
  }
}
