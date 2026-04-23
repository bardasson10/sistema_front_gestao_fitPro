
import { EstoqueRolo, IMovimentacaoRolo } from "../EstoqueRolo";
import { Cor, MovimentacaoEstoque, Tecido } from "../production";
import { PaginatedResponse } from "../production";

export interface StockProps {
  rolos: EstoqueRolo[];
  tecidos: Tecido[];
  cores: Cor[];
  isLoading: boolean;
  onEdit: (item: EstoqueRolo) => void;
  onRemove?: (id: string) => void;
  canDelete?: boolean;
  pagination?: PaginatedResponse;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;

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
  movimentacoes: IMovimentacaoRolo[];
  rolos: EstoqueRolo[];
  tecidos: Tecido[];
  cores: Cor[];
  isLoading: boolean;
}