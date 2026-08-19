import { prisma } from "../lib/prisma";

interface CreateParticipantRequest {
  raffle_id: string;
  name: string;
  email: string;
}

export class CreateParticipantService {
  async execute({ raffle_id, name, email }: CreateParticipantRequest) {
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffle_id },
    });

    if (!raffle) {
      throw new Error("Sorteio não encontrado.");
    }

    if (raffle.status !== "OPEN") {
      throw new Error(
        "Inscrições encerradas. Este sorteio não está mais aberto.",
      );
    }

    const alreadyRegistered = await prisma.participant.findUnique({
      where: {
        raffle_id_email: {
          raffle_id,
          email,
        },
      },
    });

    if (alreadyRegistered) {
      throw new Error("Você já está inscrito neste sorteio.");
    }

    const participant = await prisma.participant.create({
      data: {
        raffle_id,
        name,
        email,
      },
    });

    return participant;
  }
}
