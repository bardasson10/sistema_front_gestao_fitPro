import * as z from "zod";

export const colaboradorSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  email: z.email("Email inválido").min(1, "O email é obrigatório"),
  perfil: z.enum(["ADM", "GERENTE", "FUNCIONARIO", '']),
  funcaoSetor: z.string().min(1, "A função é obrigatória"),
  status: z.enum(["ativo", "inativo", '']),
});

export type ColaboradorFormValues = z.infer<typeof colaboradorSchema>;