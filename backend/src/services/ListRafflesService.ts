import { prisma } from "../lib/prisma";

export class ListRafflesService {
  async execute(user_id: string) {
    const raffles = await prisma.raffle.findMany({
      where: {
        user_id: user_id,
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
        _count: {
          select: { participants: true },
        },
      },
    });

    return raffles;
  }
}
