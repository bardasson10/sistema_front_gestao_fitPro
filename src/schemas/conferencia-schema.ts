import { z } from 'zod';

export const conferenciaSchema = z.object({
  statusQualidade: z.enum(['conforme', 'nao_conforme', 'com_defeito', 'validando']),
  liberadoPagamento: z.boolean(),
  observacao: z.string().optional(),
  items: z.array(
    z.object({
      tamanhoId: z.string().min(1, 'Tamanho obrigatório'),
      qtdRecebida: z.number().int().min(0, 'Quantidade deve ser maior ou igual a 0'),
      qtdDefeito: z.number().int().min(0, 'Quantidade de defeito deve ser maior ou igual a 0'),
    })
  ).min(1, 'Deve haver pelo menos um item'),
});

export type ConferenciaFormValues = z.infer<typeof conferenciaSchema>;
