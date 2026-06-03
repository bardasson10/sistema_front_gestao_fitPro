import { useMemo, useState } from "react";
import { PaginatedResponse } from "@/types/production";
import { PaginationState } from "@tanstack/react-table";

interface UsePaginationOptions {
    initialPage?: number;
    initialLimit?: number;
    serverPagination?: PaginatedResponse;
}

export function usePagination({
    initialPage = 1,
    initialLimit = 10,
    serverPagination,
}: UsePaginationOptions = {}) {
    const [page, setPage] = useState(initialPage);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: initialPage - 1, pageSize: initialLimit });
    const [limit, setLimit] = useState(initialLimit);

    const currentPage = serverPagination?.page ?? page;
    const totalPages = Math.max(serverPagination?.pages ?? 1, 1);
    const totalItems = serverPagination?.total ?? 0;

    const canPreviousPage = currentPage > 1;
    const canNextPage = currentPage < totalPages;

    const setPageSize = (nextLimit: number) => {
        setLimit(nextLimit);
        setPage(1);
    };

    const previousPage = () => {
        setPage((current) => Math.max(1, current - 1));
        setPagination((prev) => ({ ...prev, pageIndex: Math.max(0, prev.pageIndex - 1) }));
    };

    const nextPage = () => {
        setPage((current) => Math.min(totalPages, current + 1));
        setPagination((prev) => ({ ...prev, pageIndex: Math.min(prev.pageIndex + 1, totalPages - 1) }));
    };

    const goToPage = (nextPageNumber: number) => {
        setPage(Math.min(Math.max(nextPageNumber, 1), totalPages));
        setPagination((prev) => ({ ...prev, pageIndex: Math.min(Math.max(nextPageNumber - 1, 0), totalPages - 1) }));
    };

    return useMemo(
        () => ({
            page,
            limit,
            currentPage,
            totalPages,
            totalItems,
            canPreviousPage,
            canNextPage,
            setPage,
            setPageSize,
            previousPage,
            nextPage,
            goToPage,
            setPagination,
        }),
        [
            page,
            pagination,
            limit,
            currentPage,
            totalPages,
            totalItems,
            canPreviousPage,
            canNextPage,
        ]
    );
}