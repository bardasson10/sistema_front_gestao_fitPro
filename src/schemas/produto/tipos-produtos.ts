
import * as z from "zod";


export const tamanhoTipoProdutoSchema = z.object({
  id: z.string(),
  tamanhoId: z.string(),
  NomeTamanho: z.string(),
  OrdemTamanho: z.number(),
});


export const tiposProdutosSchema = z.object({
  id: z.string(),
  nome: z.string(),
  createdAt: z.string(),
  tamanhos: z.array(tamanhoTipoProdutoSchema),
});

export type TiposProdutosFormValues = z.infer<typeof tiposProdutosSchema>;

export const associarTamanhoSchema = z.object({
  tamanhos: z.array(z.string()).min(1, "Selecione pelo menos um tamanho"),
});

export type AssociarTamanhoFormValues = z.infer<typeof associarTamanhoSchema>;

export const criarTipoProdutoSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
});

export type CriarTipoProdutoFormValues = z.infer<typeof criarTipoProdutoSchema>;