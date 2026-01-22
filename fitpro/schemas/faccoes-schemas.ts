

import * as z from "zod";

export const faccoesSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  responsavel: z.string().min(1, "O responsável é obrigatório"),
  contato: z.string().min(1, "O contato é obrigatório"),
  prazoMedio: z.number().min(1, "O prazo médio deve ser no mínimo 1 dia"),
  status: z.enum(["ativo", "inativo", '']),
});

export type FaccoesFormValues = z.infer<typeof faccoesSchema>;