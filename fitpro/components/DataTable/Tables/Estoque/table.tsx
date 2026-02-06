import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData"
import { EstoqueTecido } from "@/types/production"
import { StockProps } from "@/types/StockComponents/stock-components"
import React from "react";
import { getStockColumns } from "./colums";
import { DataTable } from "@/components/DataTable";

interface StockTableProps extends StockProps {

}

export const StockTable = ({ rolos, tecidos, cores, isLoading, onEdit }: StockTableProps) => {
  const columns = React.useMemo(
    () => getStockColumns(onEdit!, tecidos, cores),
    [tecidos, onEdit, cores]);
  const data = Array.isArray(rolos) ? rolos : [];
  return (
    <div className="w-full" >
      {data.length === 0 ? (<SemDadosComponent<EstoqueTecido> nomeDado="tecido" data={rolos} />)
      :
      ( <DataTable
        columns={columns}
        data={rolos}
        isLoading={isLoading}
        getRowId={(row) => row.id}
      />)}
    </div>
  )
}