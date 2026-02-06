import React from "react";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData"
import { StockResume, StockResumeProps } from "@/types/StockComponents/stock-components"
import { DataTable } from "@/components/DataTable";
import { getGroupedStockColumns, getStockColumnsResume } from "./resume-colums";

interface ResumeStockTableProps extends StockResumeProps {

}

export const ResumeStockTable = ({ rolos, cores, tecidos, isLoading }: ResumeStockTableProps) => {
  const safeRolos = Array.isArray(rolos) ? rolos : [];
  const resumoData = React.useMemo(
    () => getGroupedStockColumns(safeRolos, tecidos, cores),
    [safeRolos, cores, tecidos]
  );
  const columns = React.useMemo(
    () => getStockColumnsResume(),
    []
  );
  const data = safeRolos;
  return (
    <div className="w-full" >
      {
        data.length === 0 ?
          (<SemDadosComponent<StockResume> nomeDado="tecido" data={resumoData} />)
          :
          (<DataTable
            columns={columns}
            data={resumoData}
            isLoading={isLoading}
            getRowId={(row) => row.id}
          />)
      }
    </div>
  )
}