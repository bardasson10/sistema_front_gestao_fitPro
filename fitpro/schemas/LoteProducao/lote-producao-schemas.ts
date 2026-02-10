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
  tecidoTipo: z.string().min(1, "Tipo obrigatório"),
  codigoReferencia: z.string().min(1, "Código de referência obrigatório"),
  rendimentoMetroKg: z.number().min(0.01, "Rendimento inválido"),
  valorPorKg: z.number().min(0.01, "Valor inválido"),
  gramatura: z.number().min(0.01, "Gramatura inválida"),
  corId: z.string().min(1, "Selecione uma cor"),
  cor: z.string().min(1, "Cor obrigatória"),
  larguraMetros: z.number().min(0.01, "Largura inválida"),
});


export const loteProducaoDirecionamentoSchema = z.object({
  id: z.string(),
  loteProducaoId: z.string(),
  tipoServico: z.string(),
  faccaoId: z.string().optional(),
  dataSaida: z.date(),
  dataPrevisaoRetorno: z.date().optional(),
  status: z.enum(['enviado', 'em_producao', 'atrasado', 'concluido', '']),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const colaboradorSchema2 = z.object({
  id: z.string(),
  nome: z.string().min(1, "O nome é obrigatório"),
  funcao: z.enum(['cortador' ,'costureira interna' , 'expedicao' , 'responsavel' , 'auxiliar','']),
  status: z.enum(["ativo", "inativo", '']),
  createdAt: z.string(),
});

export const rolosProducaoSchema = z.object({
  id: z.uuid(),
  tecidoId: z.string(),
  codigoBarraRolo: z.string().min(1, "O código de barras é obrigatório"),
  pesoInicialKg: z.number().min(0.01, "O peso inicial deve ser maior que zero"),
  pesoAtualKg: z.number().min(0, "O peso atual não pode ser negativo"),
  situacao: z.string().min(1, "A situação é obrigatória"),
});

export const loteProducaoSchema = z.object({
  codigo: z.string().min(1, "O código é obrigatório"),
  status: z.enum(['planejado', 'criado', 'cortado', 'em_producao', 'concluido', 'cancelado', '']),
  createdAt: z.string(),
  responsavelId: z.string().min(1, "O responsável é obrigatório"),
  responsavel: colaboradorSchema2,
  grade: z.array(loteProducaoGradeSchema),
  tecidosUtilizados: z.array(loteProducaoTecidoSchema),
  rolos: z.array(rolosProducaoSchema),
  direcionamentos: z.array(loteProducaoDirecionamentoSchema),
});

export type LoteProducaoFormValues = z.infer<typeof loteProducaoSchema>;