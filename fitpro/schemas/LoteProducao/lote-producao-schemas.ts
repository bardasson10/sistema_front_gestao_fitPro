import * as z from "zod";
import { colaboradorSchema } from "../colaborador-schema";
import { id } from "zod/v4/locales";


export const loteProducaoGradeSchema = z.object({ 
  id: z.string(),
  produto: z.enum(['legging', 'short', 'top', 'calca', 'conjunto', 'body', 'macaquinho', '']),
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
  cor: z.string().min(1, "Cor obrigatória"),
  pesoKg: z.number().min(0.01, "Peso inválido"),
});


export const loteProducaoDirecionamentoSchema = z.object({
  id: z.string(),
  loteId: z.string(),
  tipoProducao: z.enum(['interna', 'faccao', '']),
  faccaoId: z.string(),
  dataSaida: z.date(),
  status: z.enum(['em_producao', 'atrasado', 'concluido']),
  produtos: z.array(z.object({
    produto: z.string(),
    quantidade: z.number()
  }))
});

export const colaboradorSchema2 = z.object({
  id: z.string(),
  nome: z.string().min(1, "O nome é obrigatório"),
  funcao: z.enum(['cortador' ,'costureira interna' , 'expedicao' , 'responsavel' , 'auxiliar','']),
  status: z.enum(["ativo", "inativo", '']),
  criadoEm: z.date(),
});

export const loteProducaoSchema = z.object({
  codigo: z.string().min(1, "O código é obrigatório"),
  status: z.enum(['criado', 'cortado', 'em_producao', 'finalizado', '']),
  dataCreacao: z.date(),
  responsavelId: z.string().min(1, "O responsável é obrigatório"),
  responsavel: colaboradorSchema2,
  grade: z.array(loteProducaoGradeSchema),
  tecidosUtilizados: z.array(loteProducaoTecidoSchema),
  direcionamentos: z.array(loteProducaoDirecionamentoSchema),
});

export type LoteProducaoFormValues = z.infer<typeof loteProducaoSchema>;