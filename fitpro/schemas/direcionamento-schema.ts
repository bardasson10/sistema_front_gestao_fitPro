import { z } from 'zod';

export const direcionamentoSchema = z.object({
  tipoServico: z.enum(['costura', 'estampa', 'tingimento', 'acabamento', 'corte', 'outro']),
  faccaoId: z.string().min(1, 'Selecione uma faccao'),
  produtos: z.array(
    z.object({
      produto: z.string().optional(),
      quantidade: z.number().int().min(0, 'Quantidade deve ser maior ou igual a 0'),
    })
  ).optional(),
});

export type DirecionamentoFormValues = z.infer<typeof direcionamentoSchema>;

