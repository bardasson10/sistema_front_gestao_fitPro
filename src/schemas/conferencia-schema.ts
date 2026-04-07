import { z } from 'zod';

export const conferenciaSchema = z.object({
  statusQualidade: z.enum(['recebido', 'em_conferencia', 'aprovado', 'aprovado_parcial', 'aprovado_defeito']),
  liberadoPagamento: z.boolean(),
  observacao: z.string().optional(),
  items: z.array(
    z.object({
      tamanhoId: z.string().min(1, 'Tamanho obrigatório'),
      qtdRecebida: z.number().int().min(0, 'Quantidade deve ser maior ou igual a 0'),
      qtdDefeito: z.number().int().min(0, 'Quantidade de defeito deve ser maior ou igual a 0'),
    })
  ).min(1, 'Deve haver pelo menos um item'),
}).superRefine((values, ctx) => {
  if ((values.statusQualidade === 'recebido' || values.statusQualidade === 'em_conferencia') && values.liberadoPagamento) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['liberadoPagamento'],
      message: 'Pagamento so pode ser liberado em status aprovado.',
    });
  }

  if ((values.statusQualidade === 'aprovado_parcial' || values.statusQualidade === 'aprovado_defeito') && !values.liberadoPagamento) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['liberadoPagamento'],
      message: 'Para aprovado parcial ou aprovado defeito, o pagamento deve estar liberado.',
    });
  }
});

export type ConferenciaFormValues = z.infer<typeof conferenciaSchema>;
