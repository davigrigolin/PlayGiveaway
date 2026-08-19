import { z } from "zod";

export const createRaffleSchema = z.object({
  title: z.string().min(3, "O título precisa ter no mínimo 3 caracteres."),
  description: z.string().optional(),
});
