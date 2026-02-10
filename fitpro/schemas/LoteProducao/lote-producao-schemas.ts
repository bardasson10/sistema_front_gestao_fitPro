import * as z from "zod";

export const loteProducaoGradeSchema = z.object({ 
  id: z.string(),
  produto: z.string().min(1, "Selecione um produto"),
  produtoId: z.string().min(1, "ID do produto obrigatório"),
  gradePP: z.number().min(0),
  gradeP: z.number().min(0),
  gradeM: z.number().min(0),
  gradeG: z.number().min(0),
  gradeGG: z.number().min(0),
  total: z.number().min(0),
});

export const loteProducaoTecidoSchema = z.object({
  id: z.string(),
  roloId: z.string().min(1, "Selecione um rolo"),
  tecidoTipo: z.string(),
  codigoReferencia: z.string(),
  rendimentoMetroKg: z.number(),
  valorPorKg: z.number(),
  gramatura: z.number(),
  corId: z.string(),
  cor: z.string(),
  larguraMetros: z.number(),
  rolos: z.object({
    itens: z.array(z.object({
      id: z.string().uuid(),
      tecidoId: z.string(),
      codigoBarraRolo: z.string().min(1, "O código de barras é obrigatório"),
      pesoInicialKg: z.number().min(0.01, "O peso inicial deve ser maior que zero"),
      pesoAtualKg: z.number().min(0, "O peso atual não pode ser negativo"),
      situacao: z.string().min(1, "A situação é obrigatória"),
    })),
  }).optional(),
  pesoTotal: z.number().min(0, "O peso total não pode ser negativo").optional(),
});

export const loteProducaoDirecionamentoSchema = z.object({
  id: z.string(),
  loteProducaoId: z.string(),
  tipoServico: z.string(),
  faccaoId: z.string(),
  dataSaida: z.string(),
  dataPrevisaoRetorno: z.string(),
  status: z.enum(['enviado', 'em_producao', 'atrasado', 'concluido', '']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const colaboradorSchema2 = z.object({
  id: z.string(),
  nome: z.string(),
  perfil: z.string(),
  status: z.enum(["ativo", "inativo", '']),
  funcaoSetor: z.string(), 
});

export const rolosProducaoSchema = z.object({
  id: z.uuid(),
  tecidoId: z.string(),
  codigoBarraRolo: z.string().min(1, "O código de barras é obrigatório"),
  pesoInicialKg: z.number().min(0.01, "O peso inicial deve ser maior que zero"),
  pesoAtualKg: z.number().min(0, "O peso atual não pode ser negativo"),
  situacao: z.string().min(1, "A situação é obrigatória"),
  pesoTotal: z.number().min(0, "O peso total não pode ser negativo").optional(),
});

export const loteProducaoSchema = z.object({
  codigo: z.string().min(1, "O código é obrigatório"),
  status: z.enum(['planejado', 'criado', 'cortado', 'em_producao', 'concluido', 'cancelado', '']),
  createdAt: z.string(),
  responsavelId: z.string(),
  responsavel: colaboradorSchema2,
  grade: z.array(loteProducaoGradeSchema),
  tecido: z.array(loteProducaoTecidoSchema),
  direcionamentos: z.array(loteProducaoDirecionamentoSchema),
});

export type LoteProducaoFormValues = z.infer<typeof loteProducaoSchema>;