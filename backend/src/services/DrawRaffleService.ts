import { prisma } from "../lib/prisma";

interface DrawRaffleRequest {
  raffle_id: string;
  user_id: string; // ID de quem está logado (para garantir que só o dono pode sortear)
  quantity?: number;
}

export class DrawRaffleService {
  async execute({ raffle_id, user_id, quantity = 1 }: DrawRaffleRequest) {
    const drawQuantity = Number(quantity ?? 1);

    if (!Number.isInteger(drawQuantity) || drawQuantity < 1) {
      throw new Error(
        "A quantidade de vencedores deve ser um número inteiro maior que zero.",
      );
    }

    const raffle = await prisma.raffle.findUnique({
      where: { id: raffle_id },
      include: {
        participants: true,
      },
    });

    if (!raffle) {
      throw new Error("Sorteio não encontrado.");
    }

    if (raffle.user_id !== user_id) {
      throw new Error("Você não tem permissão para realizar este sorteio.");
    }

    if (
      raffle.status === "DRAWN" ||
      raffle.winner_id ||
      raffle.winner_ids.length > 0
    ) {
      throw new Error("Este sorteio já foi realizado.");
    }

    if (raffle.participants.length === 0) {
      throw new Error(
        "Não é possível sortear. Nenhum participante inscrito ainda.",
      );
    }

    if (drawQuantity > raffle.participants.length) {
      throw new Error(
        `A quantidade de vencedores não pode ser maior que o número de participantes (${raffle.participants.length}).`,
      );
    }

    const shuffledParticipants = [...raffle.participants].sort(
      () => Math.random() - 0.5,
    );
    const winners = shuffledParticipants.slice(0, drawQuantity);
    const winnerIds = winners.map((winner) => winner.id);

    const { count } = await prisma.raffle.updateMany({
      where: {
        id: raffle_id,
        status: { in: ["OPEN", "CLOSED"] },
      },
      data: {
        status: "DRAWN",
        winner_id: winners[0]?.id ?? null,
        winner_ids: winnerIds,
      },
    });

    if (count === 0) {
      throw new Error(
        "Conflito: Este sorteio acabou de ser realizado por outra requisição.",
      );
    }

    return {
      raffle: raffle.title,
      winner: winners[0]
        ? {
            id: winners[0].id,
            name: winners[0].name,
            email: winners[0].email,
          }
        : null,
      winners: winners.map((winner) => ({
        id: winner.id,
        name: winner.name,
        email: winner.email,
      })),
    };
  }
}
