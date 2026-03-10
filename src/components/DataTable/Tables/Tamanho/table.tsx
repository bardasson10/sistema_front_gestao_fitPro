"use client";

import React from "react";
import { DataTable } from "@/components/DataTable";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";
import { Tamanho } from "@/hooks/queries/useProdutos";
import { getTamanhoColumns } from "./columns";

interface TamanhoTableProps {
	tamanhos: Tamanho[];
	isLoading: boolean;
	onEdit: (item: Tamanho) => void;
	onRemove: (id: string) => void;
}

export const TamanhoTable: React.FC<TamanhoTableProps> = ({
	tamanhos,
	isLoading,
	onEdit,
	onRemove,
}) => {
	const columns = React.useMemo(() => getTamanhoColumns(onEdit, onRemove), [onEdit, onRemove]);
	const data = Array.isArray(tamanhos) ? tamanhos : [];

	return (
		<div className="w-full">
			{data.length === 0 ? (
				<SemDadosComponent<Tamanho> nomeDado="tamanho" data={data} />
			) : (
				<DataTable columns={columns} data={data} isLoading={isLoading} getRowId={(row) => row.id} />
			)}
		</div>
	);
};
