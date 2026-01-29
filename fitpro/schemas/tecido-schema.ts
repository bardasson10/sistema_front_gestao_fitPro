
import * as z from "zod";
export const fabricSchema = z.object({
  tipo: z.string().min(2, "O tipo deve ter pelo menos 2 caracteres"),
  cor: z.string().min(1, "A cor é obrigatória"),
  valorPorKg: z.number().min(0.1, "O valor por kg deve ser maior que 0"),
  largura: z.number().min(10, "Largura mínima de 10 cm"),
  rendimento: z.number().min(0.1, "Rendimento mínimo de 0.1"),
  fornecedorId: z.string().min(1, "Selecione um fornecedor"),
  unidade: z.enum(["kg"])
});

export type FabricFormValues = z.infer<typeof fabricSchema>;