// components/Forms/LoteProducao/interface-lote-form.ts

export interface RoloProducao {
  estoqueRoloId: string
  pesoReservado: number
}

export type RoloProducaoCreate = Omit<RoloProducao, "pesoReservado">

export type CorSelect = {
  id: string
  nome: string
  codigoHex: string
}

export type MaterialRoloSelect = {
  tecidoId: string
  nome: string
  codigoBarraRolo: string
}

// Grade: chave = "produtoId::tamanhoId", valor = quantidade planejada
export interface GradeLote {
  id: string
  produtoId: string
  tamanhoId: string
  quantidadePlanejada: number
  produtoNome: string
  sku: string
  tamanhoNome: string
}

export interface Enfesto {
  corId: string
  qtdFolhas: number
  rolosProducao: RoloProducao[]
  produtosSelecionados?: string[]
  itens: GradeLote[]
}

export interface LoteFormData {
  loteId: string
  codigoLote: string
  status: string
  observacao: string
  qtdFolhas: number
  enfestos: Enfesto[]
}