import * as z from "zod";

export const produtoSchema = z.object({
	id: z.string().optional(),
	tipoProdutoId: z.string().min(1, "O tipo do produto é obrigatório"),
	nome: z.string().min(1, "O nome é obrigatório"),
	sku: z.string().min(1, "O SKU é obrigatório"),
	fabricante: z.string().min(1, "O fabricante é obrigatório"),
	custoMedioPeca: z.number().min(0, "O custo deve ser maior ou igual a 0"),
	precoMedioVenda: z.number().min(0, "O preço deve ser maior ou igual a 0"),
});

export type ProdutoFormValues = z.infer<typeof produtoSchema>;
