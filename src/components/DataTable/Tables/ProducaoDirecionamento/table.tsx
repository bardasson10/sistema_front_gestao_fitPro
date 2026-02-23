"use client";

import React from "react";
import { DataTable } from "@/components/DataTable";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";
import {
	getProducaoDirecionamentoColumns,
	ProducaoDirecionamentoItem,
} from "./columns";

interface ProducaoDirecionamentoTableProps {
	data: ProducaoDirecionamentoItem[];
	isLoading: boolean;
	onEdit: (item: ProducaoDirecionamentoItem) => void;
	onRemove: (id: string) => void;
}

export const ProducaoDirecionamentoTable: React.FC<ProducaoDirecionamentoTableProps> = ({
	data,
	isLoading,
	onEdit,
	onRemove,
}) => {
	const columns = React.useMemo(
		() => getProducaoDirecionamentoColumns(onEdit, onRemove),
		[onEdit, onRemove],
	);

	return (
		<div className="w-full">
			{data.length === 0 ? (
				<SemDadosComponent<ProducaoDirecionamentoItem>
					nomeDado="produção direcionada"
					data={data}
				/>
			) : (
				<DataTable columns={columns} data={data} isLoading={isLoading} getRowId={(row) => row.id} />
			)}
		</div>
	);
};
