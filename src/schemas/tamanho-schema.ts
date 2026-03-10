import * as z from "zod";

export const tamanhoSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  ordem: z.number({ invalid_type_error: "A ordem é obrigatória" }).int("A ordem deve ser um número inteiro").min(1, "A ordem deve ser maior que 0"),
});

export type TamanhoFormValues = z.infer<typeof tamanhoSchema>;
