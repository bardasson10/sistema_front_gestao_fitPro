"use client";

import React from "react";
import { Cor } from "@/types/production";
import { DataTable } from "@/components/DataTable";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";
import { getCoresColumns } from "./columns";

interface CoresTableProps {
	cores: Cor[];
	isLoading: boolean;
	onEdit: (item: Cor) => void;
	onRemove: (id: string) => void;
}

export const CoresTable: React.FC<CoresTableProps> = ({
	cores,
	isLoading,
	onEdit,
	onRemove,
}) => {
	const columns = React.useMemo(() => getCoresColumns(onEdit, onRemove), [onEdit, onRemove]);
	const data = Array.isArray(cores) ? cores : [];

	return (
		<div className="w-full">
			{data.length === 0 ? (
				<SemDadosComponent<Cor> nomeDado="cor" data={data} />
			) : (
				<DataTable columns={columns} data={data} isLoading={isLoading} getRowId={(row) => row.id} />
			)}
		</div>
	);
};
