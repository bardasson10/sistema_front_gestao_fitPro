
import { EstoqueRolo } from "../EstoqueRolo";
import { Cor, MovimentacaoEstoque, Tecido } from "../production";

export interface StockProps {
  rolos: EstoqueRolo[];
  tecidos: Tecido[];
  cores: Cor[];
  isLoading: boolean;
  onEdit: (item: EstoqueRolo) => void;

}

export interface StockResume {
  id: string;
  codigoReferencia: string;
  cor: string;
  nomeCor: string;
  rolos: number;
  pesoKg: number;
  valorTotal: number;
}

export interface StockResumeProps {
  rolos: EstoqueRolo[];
  tecidos: Tecido[];
  cores: Cor[];
  isLoading: boolean;
}

export interface StockMovimentacao {
  movimentacoes: MovimentacaoEstoque[];
  rolos: EstoqueRolo[];
  tecidos: Tecido[];
  cores: Cor[];
  isLoading: boolean;
}