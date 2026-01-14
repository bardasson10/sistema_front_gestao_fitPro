

import { Tecido } from "@/types/production";
import { RowSelectionState, SortingState } from "@tanstack/react-table";
import { FabricColumnProps, Fabriccolumns } from "./colums";
import { DataTable } from "@/components/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

interface FabricTableProps extends Omit<FabricColumnProps, 'item'> {
  tecido: Tecido[];
  isLoading: boolean;
  getRowId: (tecido: Tecido) => string;
}

export const FabricTable: React.FC<FabricTableProps> = ({
  tecido,
  isLoading,
  getRowId,
  setEditingItem,
  setFormData,
  setIsOpen,
  fornecedores,
}) => {

  const [ordenacao, setOrdenacao] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton para tabelas organizadas */}
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={`skeleton-group-${idx}`}>
            <div className="p-1">
              <Skeleton className="h-6 rounded w-48" />
            </div>
            <div className="p-1">
              <Skeleton className="h-5 rounded w-64" />
            </div>
            <div className="p-1">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, rowIdx) => (
                  <div key={`skeleton-row-${idx}-${rowIdx}`} className="flex space-x-4">
                    <Skeleton className="h-4 rounded w-1/3" />
                    <Skeleton className="h-4 rounded w-1/4" />
                    <Skeleton className="h-4 rounded w-1/5" />
                    <Skeleton className="h-4 rounded w-1/6" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!tecido || tecido.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum dado encontrado para o período selecionado.
      </div>
    );
  }

  return (
    <div className="space-y-8 px-1 lg:px-4">
          {/* Tabela de Anúncios */}
          <div className="mb-6">
            <DataTable
              columns={
                Fabriccolumns({
                  setEditingItem: setEditingItem,
                  setFormData: setFormData,
                  setIsOpen: setIsOpen,
                  fornecedores: fornecedores,
                })}
              data={tecido}
              isLoading={false}
              ordenacao={ordenacao}
              setOrdenacao={setOrdenacao}
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
              getRowId={getRowId}
            />
          </div>
        </div>
  );
}
