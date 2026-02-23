interface Tamanho {
  id: string;
  nome: string;
  ordem: number;
}

interface Produto {
  id: string;
  tipoProdutoId: string;
  nome: string;
  sku: string;
  fabricante: string;
  custoMedioPeca: string;
  precoMedioVenda: string;
  createdAt: string;
  updatedAt: string;
}

interface LoteItem {
  id: string;
  loteProducaoId: string;
  produtoId: string;
  tamanhoId: string;
  quantidadePlanejada: number;
  produto: Produto;
  tamanho: Tamanho;
}

interface Tecido {
  id: string;
  fornecedorId: string;
  corId: string;
  nome: string;
  codigoReferencia: string;
  rendimentoMetroKg: string;
  larguraMetros: string;
  valorPorKg: string;
  gramatura: string;
  createdAt: string;
  updatedAt: string;
}

interface LoteProducao {
  id: string;
  codigoLote: string;
  tecidoId: string;
  responsavelId: string;
  status: string;
  observacao: string;
  createdAt: string;
  updatedAt: string;
  tecido: Tecido;
  items: LoteItem[];
}

interface Faccao {
  id: string;
  nome: string;
  responsavel: string;
  contato: string;
  prazoMedioDias: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Conferencia {
  id: string;
  direcionamentoId: string;
  responsavelId: string;
  dataConferencia: string;
  observacao: string;
  liberadoPagamento: boolean;
  statusQualidade: string;
  createdAt: string;
  updatedAt: string;
}

export interface DirecionamentoSchema {
  id: string;
  loteProducaoId: string;
  faccaoId: string;
  tipoServico: string;
  status: string;
  dataSaida: string;
  dataPrevisaoRetorno: string;
  createdAt: string;
  updatedAt: string;
  lote: LoteProducao;
  faccao: Faccao;
  conferencias: Conferencia[];
}



