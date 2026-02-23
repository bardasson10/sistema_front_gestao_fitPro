import { Cor, Tecido } from "../production";

export interface FabricProps {
  tecidos: Tecido[];
  cores: Cor[];
  isLoading: boolean;
  fornecedores: { id: string; nome: string }[];
  onEdit: (item: Tecido) => void;
  onRemove: (id: string) => void;
}