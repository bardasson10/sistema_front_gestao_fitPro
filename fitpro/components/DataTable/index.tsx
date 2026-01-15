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
  tabelaRepeticoes
}: TabelaProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setOrdenacao,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getRowId,
    state: {
      sorting: ordenacao,
      rowSelection: rowSelection || {},
    },
  })

  const skeletonRows = 10

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
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
                {columns.map((_, colIdx) => (
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
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Nenhum resultado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {table.getPrePaginationRowModel().rows.length > 9 && !isLoading &&
        <TablePagination table={table} tabelaRepeticoes={tabelaRepeticoes} />
      }
    </div>
  )
}
