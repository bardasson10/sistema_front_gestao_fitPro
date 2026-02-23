
import * as z from "zod";

export const fabricSchema = z.object({
  id: z.string().optional(),
  fornecedorId: z.uuid("ID de fornecedor inválido"),
  corId: z.uuid("ID de cor inválido"),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  codigoReferencia: z.string().optional(),
  rendimentoMetroKg: z.number().nonnegative("Rendimento deve ser positivo").optional(),
  larguraMetros: z.number().nonnegative("Largura deve ser positiva").optional(),
  valorPorKg: z.number().nonnegative("Valor deve ser positivo").optional(),
  gramatura: z.number().nonnegative("Gramatura deve ser positiva").optional(),
});

export type FabricFormValues = z.infer<typeof fabricSchema>;