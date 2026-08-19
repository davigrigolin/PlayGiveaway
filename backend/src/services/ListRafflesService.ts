import { prisma } from "../lib/prisma";

export class ListRafflesService {
  async execute(user_id: string) {
    // Busca todos os sorteios onde o dono é o usuário logado
    const raffles = await prisma.raffle.findMany({
      where: {
        user_id: user_id,
      },
      // Ordena do mais recente para o mais antigo
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
