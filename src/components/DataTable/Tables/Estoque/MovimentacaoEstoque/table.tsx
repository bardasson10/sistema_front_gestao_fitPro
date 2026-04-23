import React from "react";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData"
import { StockMovimentacao } from "@/types/StockComponents/stock-components"
import { DataTable } from "@/components/DataTable";
import { getStockMovementColumns } from "./columns"
import { IMovimentacaoRolo } from "@/types/EstoqueRolo";
import { ServerPagination } from "@/components/DataTable/TablePagination/server-pagination";


interface MovementStockTableProps extends StockMovimentacao {

}

export const MovementStockTable = ({
    movimentacoes,
    rolos,
    cores,
    tecidos,
    isLoading,
    pagination,
    currentPage = 1,
    onPageChange,
    pageSize,
    onPageSizeChange,
}: MovementStockTableProps) => {

    const columns = React.useMemo(
        () => getStockMovementColumns(rolos, tecidos, cores),
        [rolos, tecidos, cores]
    );

    const data = Array.isArray(movimentacoes) ? movimentacoes : [];


    return (
        <div className="w-full" >
            {
                data.length === 0 ?
                    (<SemDadosComponent<IMovimentacaoRolo> nomeDado="movimentação" data={data} />)
                    :
                    (<div className="border rounded-lg overflow-hidden">
                        <DataTable
                            columns={columns}
                            data={data}
                            isLoading={isLoading}
                            getRowId={(row) => row.id}
                            showPagination={false}
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
                    </div>)
            }
        </div>
    )
}