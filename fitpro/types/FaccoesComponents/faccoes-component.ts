import { Faccao } from "../production";

export interface FaccoesProps {
  faccoes: Faccao[];
  isLoading: boolean;
  onEdit: (item: Faccao) => void;
  onRemove: (id: string) => void;
}