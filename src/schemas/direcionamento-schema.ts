import { z } from 'zod';

const tipoServicoSchema = z.enum(['costura', 'estampa', 'tingimento', 'acabamento', 'corte', 'outro']);

const gradeItemSchema = z.object({
  corId: z.string().min(1, 'Cor inválida'),
  produtoId: z.string().min(1, 'Produto inválido'),
  tamanhoId: z.string().min(1, 'Tamanho inválido'),
  quantidade: z.number().int().min(0, 'Quantidade deve ser maior ou igual a 0'),
});

export const direcionamentoSchema = z.object({
  tipoServico: tipoServicoSchema.optional(),
  faccaoId: z.string().optional(),
  direcionamentos: z.array(
    z.object({
      faccaoId: z.string().min(1, 'Selecione uma faccao'),
      tipoServico: tipoServicoSchema,
      quantidade: z.number().int().min(1, 'Quantidade deve ser maior que 0').optional(),
      dataSaida: z.string().optional(),
      dataPrevisaoRetorno: z.string().optional(),
      items: z.array(gradeItemSchema).optional(),
    })
  ).min(1, 'Adicione ao menos um direcionamento'),
  produtos: z.array(
    z.object({
      produto: z.string().optional(),
      quantidade: z.number().int().min(0, 'Quantidade deve ser maior ou igual a 0'),
    })
  ).optional(),
});

export type GradeItemFormValues = z.infer<typeof gradeItemSchema>;
export type DirecionamentoFormValues = z.infer<typeof direcionamentoSchema>;

