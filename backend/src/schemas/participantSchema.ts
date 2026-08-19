import { z } from "zod";

export const createParticipantSchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres."),
  email: z.string().email("Formato de e-mail inválido."),
});
