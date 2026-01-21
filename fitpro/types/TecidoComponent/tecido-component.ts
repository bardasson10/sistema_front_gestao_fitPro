import { Tecido } from "../production";

export interface FabricProps {
  tecidos: Tecido[];
  isLoading: boolean;
  fornecedores: { id: string; nome: string }[];
  onEdit: (item: Tecido) => void;
  onRemove: (id: string) => void;
}