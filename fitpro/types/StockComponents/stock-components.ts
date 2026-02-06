import { Cor, EstoqueTecido, Tecido } from "../production";

export interface StockProps {
  rolos: EstoqueTecido[];
  tecidos: Tecido[];
  cores: Cor[];
  isLoading: boolean;
  onEdit: (item: EstoqueTecido) => void;

}

export interface StockResume {
  id: string;
  tipo: string;
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