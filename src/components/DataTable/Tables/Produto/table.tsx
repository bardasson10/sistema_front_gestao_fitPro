"use client";

import React from "react";
import { DataTable } from "@/components/DataTable";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";
import { Produto, TiposProdutosSchema } from "@/hooks/queries/useProdutos";
import { getProdutoColumns } from "./columns";

interface ProdutoTableProps {
	produtos: Produto[];
	tiposProduto: TiposProdutosSchema[];
	isLoading: boolean;
	onEdit: (item: Produto) => void;
	onRemove: (id: string) => void;
}

export const ProdutoTable: React.FC<ProdutoTableProps> = ({
	produtos,
	tiposProduto,
	isLoading,
	onEdit,
	onRemove,
}) => {
	const columns = React.useMemo(
		() => getProdutoColumns(onEdit, onRemove, tiposProduto),
		[onEdit, onRemove, tiposProduto],
	);

	const data = Array.isArray(produtos) ? produtos : [];

	return (
		<div className="w-full">
			{data.length === 0 ? (
				<SemDadosComponent<Produto> nomeDado="produto" data={data} />
			) : (
				<DataTable columns={columns} data={data} isLoading={isLoading} getRowId={(row) => row.id} />
			)}
		</div>
	);
};
