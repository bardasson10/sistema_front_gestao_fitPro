"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  RowSelectionState,
  VisibilityState,
  PaginationState
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Skeleton } from "@/components/ui/skeleton"
import { TablePagination } from "./TablePagination/table-pagination"

interface TabelaProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  ordenacao?: SortingState
  setOrdenacao?: React.Dispatch<React.SetStateAction<SortingState>>
  isLoading?: boolean
  rowSelection?: RowSelectionState
  setRowSelection?: React.Dispatch<React.SetStateAction<RowSelectionState>>
  getRowId?: (row: TData) => string
  tabelaRepeticoes?: boolean
  columnVisibility?: VisibilityState
  manualPagination?: boolean
  pagination?: PaginationState
  setPagination?: React.Dispatch<React.SetStateAction<PaginationState>>
  pageCount?: number

}

export function DataTable<TData, TValue>({
  columns,
  data,
  ordenacao,
  setOrdenacao,
  isLoading = false,
  rowSelection,
  setRowSelection,
  getRowId,
  tabelaRepeticoes,
  columnVisibility,
  manualPagination = false,
  pagination,
  setPagination,
  pageCount,
}: TabelaProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    manualPagination: manualPagination,
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setOrdenacao,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    pageCount: pageCount,
    onPaginationChange: setPagination,
    getRowId,
    state: {
      sorting: ordenacao,
      rowSelection: rowSelection || {},
      columnVisibility: columnVisibility || {},
      // Substitua aquela linha do pagination por esta:
      ...(pagination !== undefined && { pagination }), 
    },
    
  })

  const skeletonRows = 10

  return (
    <div className="w-full bg-card rounded-lg overflow-hidden">
      <div className="w-full overflow-x-auto">
      <Table className="min-w-max rounded-lg">
        <TableHeader className="bg-table">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="bg-accent text-table-foreground font-medium">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="border-b border-table-border">
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, rowIdx) => (
              <TableRow key={`skeleton-row-${rowIdx}`} >
                {/* Ajuste para Skeleton respeitar colunas visíveis */}
                {table.getVisibleFlatColumns().map((_, colIdx) => (
                  <TableCell key={`skeleton-cell-${colIdx}`} >
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="hover:bg-accent-foreground/10 cursor-text"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                  >
                    <div
                      className={
                        `py-0
              ${cell.column.getIndex() !== 0 && cell.column.getIndex() !== row.getVisibleCells().length - 1
                          ? "pl-2"
                          : ""}`
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              {/* Colspan dinâmico baseado em colunas visíveis */}
              <TableCell colSpan={table.getVisibleFlatColumns().length} className="h-24 text-center">
                Nenhum resultado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        </Table>
      </div>
      {/* Substitua a condição antiga por esta: */}
      {!isLoading && (
        <TablePagination table={table} tabelaRepeticoes={tabelaRepeticoes} />
      )}
    </div>
 
  )
}
