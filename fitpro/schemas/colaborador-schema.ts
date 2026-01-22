import * as z from "zod";

export const colaboradorSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  funcao: z.enum(['cortador' ,'costureira interna' , 'expedicao' , 'responsavel' , 'auxiliar','']),
  status: z.enum(["ativo", "inativo", '']),
});

export type ColaboradorFormValues = z.infer<typeof colaboradorSchema>;