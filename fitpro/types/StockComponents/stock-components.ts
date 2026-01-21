import { RoloTecido } from "../production";

export interface StockProps {
  rolos: RoloTecido[];
  tecidos: { id: string; cor: string; tipo: string }[]
  isLoading: boolean;
  onEdit: (item: RoloTecido) => void;

}


export interface StockResume {
  id: string;
  tipo: string;
  cor: string;
  rolos: number;
  pesoKg: number;
}

export interface StockResumeProps {
  rolos: RoloTecido[];
  tecidos: { id: string; cor: string; tipo: string }[]
  isLoading: boolean;

}