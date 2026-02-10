// Core types for the production management system
export interface PaginatedResponse {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export interface Colaborador {
  id: string;
  nome: string;
  email: string;
  perfil: 'ADM' | 'GERENTE' | 'FUNCIONARIO' | '';
  status: 'ativo' | 'inativo' | '';
  funcaoSetor: string;
  createdAt: string;
  updatedAt?: string;
  pagination?: PaginatedResponse;
}



export interface Fornecedor {
  id: string;
  nome: string;
  tipo: 'tecido' | 'aviamento' | 'servico' | '';
  contato: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Faccao {
  id: string;
  nome: string;
  responsavel: string;
  contato: string;
  prazoMedioDias: number; // dias
  status: 'ativo' | 'inativo' | '';
  createdAt: string;
}

export interface Cor {
  id: string;
  nome: string;
  codigoHex: string;
}

export interface Tecido {
  id: string;
  tipo: string;
  corId: string;
  nome: string;
  codigoReferencia: string;
  fornecedorId: string;
  rendimentoMetroKg: number;
  larguraMetros: number;
  valorPorKg: number;
  gramatura: number;
  createdAt: string;
  updatedAt?: string;
}

export interface EstoqueTecido {
  id: string;
  tecidoId: string;
  codigoBarraRolo: string;
  pesoInicialKg: number;
  pesoAtualKg: number;
  situacao: "disponivel" | "reservado" | "em_uso" | "descartado" | "";
  createdAt: string;
  updatedAt?: string;
  movimentacoes: MovimentacaoEstoque[];
}

export interface MovimentacaoEstoque {
  id: string;
  estoqueRoloId: string;
  tipoMovimentacao: 'entrada' | 'saida' | 'ajuste' | 'devolucao';
  pesoMovimentado: number;
  createdAt: string;
  usuario: {
    id: string;
    nome: string;
    funcaoSetor: string;
  }
}

export interface Produto {
  id: string;
  tipoProdutoId: string;
  nome: string;
  sku: string;
  fabricante: string;
  custoMedioPeca: number;
  precoMedioVenda: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Tamanho {
  id: string;
  nome: string;
  ordem: number;
}

export interface LoteProducao {
  id: string;
  codigoLote: string;
  tecidoId: string;
  responsavelId: string;
  responsavel?: Colaborador;
  status: 'planejado' | 'criado' | 'cortado' | 'em_producao' | 'concluido' | 'cancelado' | '';
  tecido?: Tecido & {
    rolos: EstoqueTecido[];
  };
  items?: ItemsLoteProducao[];
  grade?: GradeProduto[];
  direcionamentos?: Direcionamento[];
  observacao?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ItemsLoteProducao {
  id: string;
  loteProducaoId: string;
  produtoId: string;
  tamanhoId: string;
  quantidadePlanejada: number;
  produto?: Produto;
  tamanho?: Tamanho;
}

export interface ColaboradorLote {
  id: string;
  nome: string;
  funcao: 'cortador' | 'costureira interna' | 'expedicao' | 'responsavel' | 'auxiliar' | '';
  status: "ativo" | "inativo" | '';
  createdAt: string;
}

export interface TecidoLote {
  roloId: string;
  rolo?: EstoqueTecido;
  tecidoTipo: string;
  cor: string;
  pesoKg: number;
}

export interface GradeProduto {
  id: string;
  produtoId: string;
  produto: string;
  gradePP: number;
  gradeP: number;
  gradeM: number;
  gradeG: number;
  gradeGG: number;
  total: number;
}

export interface Direcionamento {
  id: string;
  loteProducaoId: string;
  faccaoId?: string;
  faccao?: Faccao;
  tipoServico: string;
  dataSaida: string; // data de saída para produção
  dataPrevisaoRetorno?: string; // data prevista de retorno
  status: 'enviado' | 'em_producao' | 'atrasado' | 'concluido' | '';
  createdAt?: string;
  updatedAt?: string;
}

export interface ProdutoDirecionado {
  produto: string;
  quantidade: number;
}

export interface Conferencia {
  id: string;
  loteId: string;
  lote?: LoteProducao;
  direcionamentoId: string;
  faccaoId?: string;
  tipoProducao: 'interna' | 'faccao' | '';
  produtosEsperados: ProdutoDirecionado[];
  produtosRecebidos: ProdutoDirecionado[];
  divergencia: boolean;
  avaliacaoQualidade: 'aprovado' | 'reprovado' | 'parcial' | '';
  observacoes?: string;
  dataConferencia: string;
  liberadoPagamento: boolean;
}

export type FuncaoColaborador = Colaborador['funcaoSetor'];
export type TipoFornecedor = Fornecedor['tipo'];
export type StatusLote = LoteProducao['status'];
export type TipoProduto = GradeProduto['produto'];
export type StatusDirecionamento = Direcionamento['status'];
export type AvaliacaoQualidade = Conferencia['avaliacaoQualidade'];


export interface ProductionContextType {
  // Colaboradores
  colaboradores: Colaborador[];
  addColaborador: (colaborador: Omit<Colaborador, 'id' | 'createdAt'>) => void;
  updateColaborador: (id: string, colaborador: Partial<Colaborador>) => void;
  removeColaborador: (id: string) => void;
  
  // Fornecedores
  fornecedores: Fornecedor[];
  addFornecedor: (fornecedor: Omit<Fornecedor, 'id' | 'createdAt'>) => void;
  updateFornecedor: (id: string, fornecedor: Partial<Fornecedor>) => void;
  removeFornecedor: (id: string) => void;
  
  // Facções
  faccoes: Faccao[];
  addFaccao: (faccao: Omit<Faccao, 'id' | 'createdAt'>) => void;
  updateFaccao: (id: string, faccao: Partial<Faccao>) => void;
  removeFaccao: (id: string) => void;
  
  // Tecidos
  tecidos: Tecido[];
  addTecido: (tecido: Omit<Tecido, 'id' | 'createdAt'>) => void;
  updateTecido: (id: string, tecido: Partial<Tecido>) => void;
  removeTecido: (id: string) => void;
  
  // Rolos de Tecido
  rolos: EstoqueTecido[];
  addRolo: (rolo: Omit<EstoqueTecido, 'id' | 'createdAt'>) => void;
  updateRolo: (id: string, rolo: Partial<EstoqueTecido>) => void;
  removeRolo: (id: string) => void;
  
  // Movimentações
  movimentacoes: MovimentacaoEstoque[];
  addMovimentacao: (mov: Omit<MovimentacaoEstoque, 'id'>) => void;
  updateMovimentacao: (id: string, mov: Partial<MovimentacaoEstoque>) => void;
  removeMovimentacao: (id: string) => void;
  
  // Lotes
  lotes: LoteProducao[];
  addLote: (lote: Omit<LoteProducao, 'id'>) => void;
  updateLote: (id: string, lote: Partial<LoteProducao>) => void;
  removeLote: (id: string) => void;
  
  // Conferências
  conferencias: Conferencia[];
  addConferencia: (conferencia: Omit<Conferencia, 'id'>) => void;
  updateConferencia: (id: string, conferencia: Partial<Conferencia>) => void;
  removeConferencia: (id: string) => void;

  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}


