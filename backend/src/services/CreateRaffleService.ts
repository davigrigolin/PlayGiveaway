import { prisma } from "../lib/prisma";
import crypto from "crypto";

interface CreateRaffleRequest {
  title: string;
  description?: string;
  user_id: string;
}

export class CreateRaffleService {
  async execute({ title, description, user_id }: CreateRaffleRequest) {
    const baseSlug = title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const uniqueSuffix = crypto.randomBytes(3).toString("hex");
    const slug = `${baseSlug}-${uniqueSuffix}`;

    const raffle = await prisma.raffle.create({
      data: {
        title,
        description,
        slug,
        user_id,
      },
    });

    return raffle;
  }
}
