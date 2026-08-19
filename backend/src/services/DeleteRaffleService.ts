import { prisma } from "../lib/prisma";

interface DeleteRaffleRequest {
  raffle_id: string;
  user_id: string;
}

export class DeleteRaffleService {
  async execute({ raffle_id, user_id }: DeleteRaffleRequest) {
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffle_id },
      select: { id: true, user_id: true },
    });

    if (!raffle) {
      throw new Error("Sorteio não encontrado.");
    }

    if (raffle.user_id !== user_id) {
      throw new Error("Você não tem permissão para excluir este sorteio.");
    }

    await prisma.$transaction([
      prisma.participant.deleteMany({ where: { raffle_id } }),
      prisma.raffle.delete({ where: { id: raffle_id } }),
    ]);
  }
}
