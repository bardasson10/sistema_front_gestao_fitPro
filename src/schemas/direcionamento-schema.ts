import { z } from 'zod';

const tipoServicoSchema = z.enum(['costura', 'estampa', 'tingimento', 'acabamento', 'corte', 'outro']);

export const direcionamentoSchema = z.object({
  tipoServico: tipoServicoSchema.optional(),
  faccaoId: z.string().optional(),
  direcionamentos: z.array(
    z.object({
      faccaoId: z.string().min(1, 'Selecione uma faccao'),
      tipoServico: tipoServicoSchema,
      quantidade: z.number().int().min(1, 'Quantidade deve ser maior que 0'),
    })
  ).min(1, 'Adicione ao menos um direcionamento'),
  produtos: z.array(
    z.object({
      produto: z.string().optional(),
      quantidade: z.number().int().min(0, 'Quantidade deve ser maior ou igual a 0'),
    })
  ).optional(),
});

export type DirecionamentoFormValues = z.infer<typeof direcionamentoSchema>;

