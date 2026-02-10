import { Cor, EstoqueTecido, MovimentacaoEstoque, Tecido } from "../production";

export interface StockProps {
  rolos: EstoqueTecido[];
  tecidos: Tecido[];
  cores: Cor[];
  isLoading: boolean;
  onEdit: (item: EstoqueTecido) => void;

}

export interface StockResume {
  id: string;
  codigoReferencia: string;
  cor: string;
  nomeCor: string;
  rolos: number;
  pesoKg: number;
}

export interface StockResumeProps {
  rolos: EstoqueTecido[];
  tecidos: Tecido[];
  cores: Cor[];
  isLoading: boolean;
}

export interface StockMovimentacao {
  movimentacoes: MovimentacaoEstoque[];
  rolos: EstoqueTecido[];
  tecidos: Tecido[];
  cores: Cor[];
  isLoading: boolean;
}