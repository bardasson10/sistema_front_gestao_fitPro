"use client";

import React from "react";
import { Cor } from "@/types/production";
import { DataTable } from "@/components/DataTable";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";
import { getCoresColumns } from "./columns";
import { PaginationState } from "@tanstack/react-table";

interface CoresTableProps {
	cores: Cor[];
	isLoading: boolean;
	onEdit: (item: Cor) => void;
	onRemove: (id: string) => void;
	pagination: PaginationState;
	setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
	pageCount: number;
}

export const CoresTable: React.FC<CoresTableProps> = ({
	cores,
	isLoading,
	onEdit,
	onRemove,
	pagination,
	setPagination,
	pageCount,
}) => {
	const columns = React.useMemo(() => getCoresColumns(onEdit, onRemove), [onEdit, onRemove]);
	const data = Array.isArray(cores) ? cores : [];

	return (
        <div className="w-full">
            {/* Adicionamos a verificação do isLoading aqui! */}
            {data.length === 0 && !isLoading ? (
                <SemDadosComponent<Cor> nomeDado="cor" data={data} />
            ) : (
                <DataTable
                    columns={columns}
                    data={data} 
                    isLoading={isLoading}
                    getRowId={(row) => row.id}
                    pagination={pagination}
                    setPagination={setPagination}
                    pageCount={pageCount}
                    manualPagination={true}
                />
            )}
        </div>
    );
};
