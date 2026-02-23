import * as z from "zod";

export const corSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, "O nome é obrigatório"),
  codigoHex: z
    .string()
    .min(1, "O código HEX é obrigatório")
    .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, "Informe um HEX válido. Ex: #FF5733"),
});

export type CorFormValues = z.infer<typeof corSchema>;