import * as z from "zod";

export const loteProducaoGradeSchema = z.object({
  id: z.string().optional(),
  produto: z.string().min(1, "Selecione um produto"),
  produtoId: z.string().min(1, "ID do produto obrigatório"),
  gradePP: z.number().default(0),
  gradeP: z.number().default(0),
  gradeM: z.number().default(0),
  gradeG: z.number().default(0),
  gradeGG: z.number().default(0),
  total: z.number().default(0),
});

// --- Responsável ---
export const colaboradorSchema = z.object({
  id: z.string(),
  nome: z.string(),
  perfil: z.string(),
  status: z.string(),
  funcaoSetor: z.string().optional(),
});

// --- Tecido e seus aninhados ---
export const fornecedorSchema = z.object({
  id: z.string(),
  nome: z.string(),
  tipo: z.string(),
  contato: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const corSchema = z.object({
  id: z.string(),
  nome: z.string(),
  codigoHex: z.string(),
});

export const roloItemSchema = z.object({
  id: z.string(),
  tecidoId: z.string(),
  codigoBarraRolo: z.string(),
  pesoInicialKg: z.string(),
  pesoAtualKg: z.string(),
  situacao: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  pesoReservado: z.number(),
});

export const tecidoSchema = z.object({
  id: z.string(),
  fornecedorId: z.string(),
  corId: z.string(),
  nome: z.string(),
  codigoReferencia: z.string(),
  rendimentoMetroKg: z.string(),
  larguraMetros: z.string(),
  valorPorKg: z.string(),
  gramatura: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  fornecedor: fornecedorSchema,
  cor: corSchema,
  rolos: z.object({
    itens: z.array(roloItemSchema),
  }),
  pesoTotal: z.number(),
});

// --- Itens da Grade (Produtos) ---
export const itemLoteSchema = z.object({
  id: z.string().optional(),
  loteProducaoId: z.string().optional(),
  produtoId: z.string(),
  tamanhoId: z.string(),
  quantidadePlanejada: z.number(),
  produto: z.object({
    id: z.string(),
    tipoProdutoId: z.string(),
    nome: z.string(),
    sku: z.string(),
    fabricante: z.string(),
    custoMedioPeca: z.string(),
    precoMedioVenda: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }).optional(),
  tamanho: z.object({
    id: z.string(),
    nome: z.string(),
    ordem: z.number(),
  }).optional(),
});

// --- Direcionamentos ---
export const direcionamentoSchema = z.object({
  id: z.string(),
  loteProducaoId: z.string(),
  faccaoId: z.string(),
  tipoServico: z.string(),
  status: z.string(),
  dataSaida: z.string(),
  dataPrevisaoRetorno: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// --- Schema Principal do Lote (O objeto dentro de "data") ---
export const loteProducaoSchema = z.object({
  id: z.string(),
  codigoLote: z.string().min(1, "Obrigatório"),
  tecidoId: z.string(),
  responsavelId: z.string(),
  status: z.string(),
  observacao: z.string().nullable().or(z.literal("")), 
  createdAt: z.string(),
  updatedAt: z.string(),
  tecido: tecidoSchema,
  responsavel: colaboradorSchema,
  items: z.array(itemLoteSchema),
  direcionamentos: z.array(direcionamentoSchema),
});

export const loteProducaoFormSchema = loteProducaoSchema.extend({
  rolosSelecionados: z.array(
    z.object({
      estoqueRoloId: z.string(),
      pesoReservado: z.number(),
    })
  ).default([]),
});


export type LoteProducaoFormValues = z.infer<typeof loteProducaoSchema>;


export const initialValuesLote: LoteProducaoFormValues = {
  id: "", // ou uma string vazia se preferir
  codigoLote: "",
  status: 'planejado',
  observacao: "",
  createdAt: "",
  updatedAt: "",
  responsavelId: "",
  tecidoId: "",
  
  // Objeto de responsável conforme o schema
  responsavel: {
    id: "",
    nome: "",
    perfil: "",
    status: "ativo",
    funcaoSetor: ""
  },

  // No seu JSON é um objeto, não um array []
  tecido: {
    id: "",
    fornecedorId: "",
    corId: "",
    nome: "",
    codigoReferencia: "",
    rendimentoMetroKg: "0",
    larguraMetros: "0",
    valorPorKg: "0",
    gramatura: "0",
    createdAt: "",
    updatedAt: "",
    pesoTotal: 0,
    fornecedor: {
      id: "",
      nome: "",
      tipo: "",
      createdAt: "",
      updatedAt: ""
    },
    cor: {
      id: "",
      nome: "",
      codigoHex: ""
    },
    rolos: {
      itens: []
    }
  },


  // No seu JSON a lista de tamanhos/produtos chama-se 'items'
  items: [], 
  
  direcionamentos: []
};