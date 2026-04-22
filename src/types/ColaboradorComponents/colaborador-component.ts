import { Colaborador } from "../production";
import { PaginatedResponse } from "../production";


export interface ColaboradorProps {
  colaboradores: Colaborador[];
  isLoading: boolean;
  onEdit: (item: Colaborador) => void;
  onRemove: (id: string) => void;
  pagination?: PaginatedResponse;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
}