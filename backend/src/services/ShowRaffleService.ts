import { prisma } from "../lib/prisma";

interface ShowRaffleRequest {
  slug: string;
}

export class ShowRaffleService {
  async execute({ slug }: ShowRaffleRequest) {
    const raffle = await prisma.raffle.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        winner_id: true,
        winner_ids: true,
        created_at: true,
        user: { select: { name: true } },
        _count: { select: { participants: true } },
      },
    });

    if (!raffle) {
      throw new Error("Sorteio não encontrado.");
    }

    let winnerName = null;
    let winnerNames: string[] = [];

    const winnerIdsFromRaffle = Array.isArray((raffle as any).winner_ids)
      ? (raffle as any).winner_ids
      : [];

    const winnerIds =
      winnerIdsFromRaffle.length > 0
        ? winnerIdsFromRaffle
        : raffle.winner_id
          ? [raffle.winner_id]
          : [];

    if (winnerIds.length > 0) {
      const winners = await prisma.participant.findMany({
        where: { id: { in: winnerIds } },
        select: { name: true },
      });

      winnerNames = winners.map((winner) => winner.name);
      winnerName = winnerNames[0] ?? null;
    }

    return {
      id: raffle.id,
      title: raffle.title,
      description: raffle.description,
      status: raffle.status,
      organizer: raffle.user.name,
      participantsCount: raffle._count.participants,
      winner: winnerName,
      winners: winnerNames,
    };
  }
}
