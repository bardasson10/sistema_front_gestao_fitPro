import { Fornecedor } from "../production";

export interface FornecedorProps {
  fornecedores: Fornecedor[];
  isLoading: boolean;
  onEdit: (item: Fornecedor) => void;
  onRemove: (id: string) => void;
}