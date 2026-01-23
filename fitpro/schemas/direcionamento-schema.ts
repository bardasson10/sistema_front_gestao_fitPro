import { z } from 'zod';

export const direcionamentoSchema = z.object({
  tipoProducao: z.enum(['interna', 'faccao']),
  faccaoId: z.string().optional(),
  produtos: z.array(
    z.object({
      produto: z.string(),
      quantidade: z.number().int().min(0, 'Quantidade deve ser maior ou igual a 0'),
    })
  ).min(1, 'Deve haver pelo menos um produto'),
}).refine(
  (data) => {
    // Se tipo de produção for facção, faccaoId é obrigatório
    if (data.tipoProducao === 'faccao') {
      return !!data.faccaoId && data.faccaoId.length > 0;
    }
    return true;
  },
  {
    message: 'Selecione uma facção',
    path: ['faccaoId'],
  }
).refine(
  (data) => {
    // Ao menos um produto deve ter quantidade maior que 0
    return data.produtos.some((p) => p.quantidade > 0);
  },
  {
    message: 'Ao menos um produto deve ter quantidade maior que 0',
    path: ['produtos'],
  }
);

export type DirecionamentoFormValues = z.infer<typeof direcionamentoSchema>;

