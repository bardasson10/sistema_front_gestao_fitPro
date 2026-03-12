import * as z from "zod";

const loteResponsavelSchema = z.object({
  id: z.string(),
  nome: z.string(),
  funcaoSetor: z.string(),
});

const coresRoloMateriaisSchema = z.object({
  id: z.string(),
  codigoBarraRolo: z.string(),
  pesoAtualKg: z.number(),
  pesoReservado: z.number(),
  situacao: z.string(),
});

const gradeLoteItemSchema = z.object({
  id: z.string(),
  produtoId: z.string(),
  tamanhoId: z.string(),
  qtdMultiplicadorGrade: z.number(),
  quantidadePlanejada: z.number(),
  produtoNome: z.string(),
  sku: z.string(),
  tamanhoNome: z.string(),
});
const coresMateriaisSchema = z.object({
  id: z.string(),
  nome: z.string(),
  codigoHex: z.string(),
  qtdFolhas: z.number(),
  rolos: z.array(coresRoloMateriaisSchema),
  gradeLote: z.array(gradeLoteItemSchema),
});

const loteMaterialSchema = z.object({
  tecidoId: z.string(),
  nome: z.string(),
  codigReferencia: z.string(),
  rendimentoMetroKg: z.number(),
  larguraMetro: z.number(),
  gramatura: z.number(),
  valorPorKg: z.number(),
  pesoTotal: z.number(),
  cores: z.array(coresMateriaisSchema),
});


const loteDirecionamentoSchema = z.object({
  id: z.string(),
  faccaoId: z.string(),
  tipoServico: z.string(),
  status: z.string(),
  dataPrevisaoRetorno: z.string(),
});




export const loteProducaoFormSchema = z.object({
  id: z.string(),
  codigoLote: z.string(),
  tecidoId: z.string(),
  status: z.string(),
  observacao: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  responsavel: loteResponsavelSchema,
  materiais: z.array(loteMaterialSchema),
  direcionamento: z.array(loteDirecionamentoSchema),
});

export type LoteProducaoFormValues = z.infer<typeof loteProducaoFormSchema>;




export const initialValuesLote: LoteProducaoFormValues = {
  id: "",
  codigoLote: "",
  tecidoId: "",
  status: "planejado",
  observacao: "",
  createdAt: "",
  updatedAt: "",
  responsavel: {
    id: "",
    nome: "",
    funcaoSetor: "",
  },
  materiais: [],
  direcionamento: [],
};