import { Colaborador } from "../production";


export interface ColaboradorProps {
  colaboradores: Colaborador[];
  isLoading: boolean;
  onEdit: (item: Colaborador) => void;
  onRemove: (id: string) => void;
}