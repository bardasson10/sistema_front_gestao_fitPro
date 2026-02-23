'use client'
import { Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Button } from "../../ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip"




interface DataTablePaginationProps<TData> {
  table: Table<TData>
  tabelaRepeticoes?: boolean
}

export function TablePagination<TData>({
  table,
  tabelaRepeticoes = false
}: DataTablePaginationProps<TData>) {


  return (
    <div className={`flex items-center ${tabelaRepeticoes ? 'justify-end' : 'justify-between'} p-2 pb-0`}>
      {!tabelaRepeticoes &&
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} de
          {table.getFilteredRowModel().rows.length}{" "}
          {table.getFilteredSelectedRowModel().rows.length > 1 ?
            "linhas selecionadas"
            : "linha selecionada"}.
        </div>
      }
      <div className="flex items-center space-x-6 lg:space-x-8">
        {!tabelaRepeticoes &&
          <div className="flex items-center space-x-2">
            <p className="text-sm font-normal">Linhas por página</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-17.5">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 25, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        <div className="flex w-30 items-center justify-center text-sm font-normal">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="hidden size-7 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Primeira página</span>
                <ChevronsLeft />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Primeira página</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Página anterior</span>
                <ChevronLeft />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Página anterior</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Próxima página</span>
                <ChevronRight />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Próxima página</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="hidden size-7 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Última página</span>
                <ChevronsRight />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Última página</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
