'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PaginatedResponse } from '@/types/production';

interface ServerPaginationProps {
  pagination: PaginatedResponse;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  isLoading?: boolean;
}

export function ServerPagination({
  pagination,
  currentPage,
  onPageChange,
  pageSize,
  onPageSizeChange,
  isLoading = false,
}: ServerPaginationProps) {
  const canPreviousPage = currentPage > 1;
  const canNextPage = currentPage < pagination.pages;

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-table-border">
      <div className="text-muted-foreground text-sm">
        Total de {pagination.total} resultado{pagination.total !== 1 ? 's' : ''}
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        {pageSize && onPageSizeChange && (
          <div className="flex items-center space-x-2">
            <p className="text-sm font-normal">Itens por página</p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                onPageSizeChange(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-17.5">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 25, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex w-30 items-center justify-center text-sm font-normal">
          Página {currentPage} de {pagination.pages}
        </div>

        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="hidden size-7 lg:flex"
                onClick={() => onPageChange(1)}
                disabled={!canPreviousPage || isLoading}
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
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!canPreviousPage || isLoading}
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
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!canNextPage || isLoading}
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
                onClick={() => onPageChange(pagination.pages)}
                disabled={!canNextPage || isLoading}
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
  );
}
