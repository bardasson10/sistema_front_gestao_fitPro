// Core types for the production management system

export interface Colaborador {
  id: string;
  nome: string;
  funcao: 'cortador' | 'costureira interna' | 'expedicao' | 'responsavel' | 'auxiliar' | '';
  status: 'ativo' | 'inativo' | '';
  criadoEm: Date;
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

export interface RoloTecido {
  id: string;
  tecidoId: string;
  codigoBarraRolo: string;
  pesoInicialKg: number;
  pesoAtualKg: number;
  situacao: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MovimentacaoEstoque {
  id: string;
  roloId: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  loteId?: string;
  observacao?: string;
  data: Date;
}

export interface LoteProducao {
  id: string;
  codigo: string;
  dataCreacao: Date;
  responsavelId: string;
  responsavel?: Colaborador;
  status: 'criado' | 'cortado' | 'em_producao' | 'finalizado' | '';
  tecidosUtilizados: TecidoLote[];
  grade: GradeProduto[];
  direcionamentos: Direcionamento[];
}

export interface TecidoLote {
  roloId: string;
  rolo?: RoloTecido;
  tecidoTipo: string;
  cor: string;
  pesoKg: number;
}

export interface GradeProduto {
  id: string;
  produto: 'legging' | 'short' | 'top' | 'calca' | 'conjunto' | 'body' | 'macaquinho' | '';
  gradePP: number;
  gradeP: number;
  gradeM: number;
  gradeG: number;
  gradeGG: number;
  total: number;
}

export interface Direcionamento {
  id: string;
  loteId: string;
  tipoProducao: 'interna' | 'faccao' | '';
  faccaoId?: string;
  faccao?: Faccao;
  dataSaida: Date; // data de saída para produção
  dataEntregaConferencia?: Date; // data real de entrega na conferência
  produtos: ProdutoDirecionado[];
  status: 'em_producao' | 'atrasado' | 'concluido' | '';
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
  dataConferencia: Date;
  liberadoPagamento: boolean;
}

export type FuncaoColaborador = Colaborador['funcao'];
export type TipoFornecedor = Fornecedor['tipo'];
export type StatusLote = LoteProducao['status'];
export type TipoProduto = GradeProduto['produto'];
export type StatusDirecionamento = Direcionamento['status'];
export type AvaliacaoQualidade = Conferencia['avaliacaoQualidade'];


export interface ProductionContextType {
  // Colaboradores
  colaboradores: Colaborador[];
  addColaborador: (colaborador: Omit<Colaborador, 'id' | 'criadoEm'>) => void;
  updateColaborador: (id: string, colaborador: Partial<Colaborador>) => void;
  removeColaborador: (id: string) => void;
  
  // Fornecedores
  fornecedores: Fornecedor[];
  addFornecedor: (fornecedor: Omit<Fornecedor, 'id' | 'criadoEm'>) => void;
  updateFornecedor: (id: string, fornecedor: Partial<Fornecedor>) => void;
  removeFornecedor: (id: string) => void;
  
  // Facções
  faccoes: Faccao[];
  addFaccao: (faccao: Omit<Faccao, 'id' | 'criadoEm'>) => void;
  updateFaccao: (id: string, faccao: Partial<Faccao>) => void;
  removeFaccao: (id: string) => void;
  
  // Tecidos
  tecidos: Tecido[];
  addTecido: (tecido: Omit<Tecido, 'id' | 'criadoEm'>) => void;
  updateTecido: (id: string, tecido: Partial<Tecido>) => void;
  removeTecido: (id: string) => void;
  
  // Rolos de Tecido
  rolos: RoloTecido[];
  addRolo: (rolo: Omit<RoloTecido, 'id' | 'criadoEm'>) => void;
  updateRolo: (id: string, rolo: Partial<RoloTecido>) => void;
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


