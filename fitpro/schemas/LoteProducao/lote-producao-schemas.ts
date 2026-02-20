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
      pesoReservado: z.number().min(0, "O peso reservado não pode ser negativo").optional(),
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
  codigo: z.string().min(1, "Código é obrigatório"),
  status: z.enum(['planejado', 'criado', 'cortado', 'em_producao', 'concluido', 'cancelado']),
  observacao: z.string().optional(),
  createdAt: z.string().optional(),
  responsavelId: z.string().min(1, "Responsável é obrigatório"),
  responsavel: z.any().optional(), // ← Remove validação rígida, aceita qualquer coisa
  grade: z.array(z.object({
    id: z.string().optional(),
    produtoId: z.string(),
    produto: z.string(),
    gradePP: z.number().default(0),
    gradeP: z.number().default(0),
    gradeM: z.number().default(0),
    gradeG: z.number().default(0),
    gradeGG: z.number().default(0),
    total: z.number().optional(),
  })).optional().default([]),
  tecido: z.array(z.object({
    id: z.string().optional(),
    roloId: z.string(),
    codigoReferencia: z.string().optional(),
    rendimentoMetroKg: z.union([z.number(), z.string()]).pipe(z.coerce.number()).optional(), // ← Coerce string to number
    valorPorKg: z.union([z.number(), z.string()]).pipe(z.coerce.number()).optional(),
    gramatura: z.union([z.number(), z.string()]).pipe(z.coerce.number()).optional(),
    corId: z.string().optional(),
    tecidoTipo: z.string().optional(),
    cor: z.string().optional(),
    larguraMetros: z.union([z.number(), z.string()]).pipe(z.coerce.number()).optional(),
    pesoTotal: z.number().optional(),
    rolos: z.any().optional(),
  })).optional().default([]),
  direcionamentos: z.array(z.any()).optional().default([]),
});

export type LoteProducaoFormValues = z.infer<typeof loteProducaoSchema>;