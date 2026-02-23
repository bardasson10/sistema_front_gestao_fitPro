"use client";

import React from "react";
import { DataTable } from "@/components/DataTable";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";
import { Conferencia } from "@/types/production";
import { getConferenciaColumns } from "./columns";

interface ConferenciaTableProps {
	conferencias: Conferencia[];
	lotesMap: Record<string, string>;
	faccoesMap: Record<string, string>;
	isLoading: boolean;
	onEdit: (item: Conferencia) => void;
	onRemove: (id: string) => void;
}

export const ConferenciaTable: React.FC<ConferenciaTableProps> = ({
	conferencias,
	lotesMap,
	faccoesMap,
	isLoading,
	onEdit,
	onRemove,
}) => {
	const columns = React.useMemo(
		() => getConferenciaColumns({ lotesMap, faccoesMap, onEdit, onRemove }),
		[lotesMap, faccoesMap, onEdit, onRemove],
	);

	return (
		<div className="w-full">
			{conferencias.length === 0 ? (
				<SemDadosComponent<Conferencia> nomeDado="conferência" data={conferencias} />
			) : (
				<DataTable
					columns={columns}
					data={conferencias}
					isLoading={isLoading}
					getRowId={(row) => row.id}
				/>
			)}
		</div>
	);
};
