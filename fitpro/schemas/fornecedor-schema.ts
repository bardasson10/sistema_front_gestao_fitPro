import * as z from "zod";


export const fornecedorSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  tipo: z.enum(['tecido', 'aviamento', 'servico', '']),
  contato: z.string().min(1, "O contato é obrigatório"),
});

export type FornecedorFormValues = z.infer<typeof fornecedorSchema>;