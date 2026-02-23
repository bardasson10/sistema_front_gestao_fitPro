"use client";

import React from "react";
import { DataTable } from "@/components/DataTable";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";
import { TiposProdutosSchema } from "@/hooks/queries/useProdutos";
import { getTiposProdutoColumns } from "./columns";

interface TiposProdutoTableProps {
	tiposProdutos: TiposProdutosSchema[];
	isLoading: boolean;
	onAssociate: (item: TiposProdutosSchema) => void;
}

export const TiposProdutoTable: React.FC<TiposProdutoTableProps> = ({
	tiposProdutos,
	isLoading,
	onAssociate,
}) => {
	const columns = React.useMemo(
		() => getTiposProdutoColumns(onAssociate),
		[onAssociate]
	);

	const data = Array.isArray(tiposProdutos) ? tiposProdutos : [];

	return (
		<div className="w-full">
			{data.length === 0 ? (
				<SemDadosComponent<TiposProdutosSchema> nomeDado="tipo de produto" data={data} />
			) : (
				<DataTable
					columns={columns}
					data={data}
					isLoading={isLoading}
					getRowId={(row) => row.id}
				/>
			)}
		</div>
	);
};
