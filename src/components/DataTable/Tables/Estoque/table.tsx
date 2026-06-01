import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData"
import { StockProps } from "@/types/StockComponents/stock-components"
import React from "react";
import { getStockColumns } from "./colums";
import { DataTable } from "@/components/DataTable";
import { EstoqueRolo } from "@/types/EstoqueRolo";
import { ServerPagination } from "../../TablePagination/server-pagination";


interface StockTableProps extends StockProps {

}

export const StockTable = ({
  rolos,
  tecidos,
  cores,
  isLoading,
  onEdit,
  onRemove,
  canDelete = false,
  pagination,
  currentPage = 1,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: StockTableProps) => {
  const columns = React.useMemo(
    () => getStockColumns(onEdit, onRemove, canDelete, tecidos, cores),
    [tecidos, onEdit, onRemove, canDelete, cores]);
  const data = Array.isArray(rolos) ? rolos : [];
  return (
    <div className="w-full" >
      {data.length === 0 ? (<SemDadosComponent<EstoqueRolo> nomeDado="tecido" data={rolos} />)
      :
      ( <div className="border rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          getRowId={(row) => row.id}
          
        />
        {pagination && onPageChange && (
          <ServerPagination
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={onPageChange}
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
            isLoading={isLoading}
          />
        )}
      </div>)}
    </div>
  )
}