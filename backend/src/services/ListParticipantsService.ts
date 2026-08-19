import { prisma } from "../lib/prisma";

interface ListParticipantsRequest {
  raffle_id: string;
  user_id: string;
}

export class ListParticipantsService {
  async execute({ raffle_id, user_id }: ListParticipantsRequest) {
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
            created_at: "desc",
          },
        },
      },
    });

    if (!raffle) {
      throw new Error("Sorteio não encontrado.");
    }

    if (raffle.user_id !== user_id) {
      throw new Error(
        "Você não tem permissão para ver os participantes deste sorteio.",
      );
    }

    return raffle.participants;
  }
}
