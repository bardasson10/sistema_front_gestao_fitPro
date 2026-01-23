import { z } from 'zod';

export const conferenciaSchema = z.object({
  produtosRecebidos: z.array(
    z.object({
      produto: z.string(),
      quantidade: z.number().int().min(0, 'Quantidade deve ser maior ou igual a 0'),
    })
  ).min(1, 'Deve haver pelo menos um produto'),
  avaliacaoQualidade: z.enum(['aprovado', 'reprovado', 'parcial']),
  observacoes: z.string().optional(),
});

export type ConferenciaFormValues = z.infer<typeof conferenciaSchema>;
