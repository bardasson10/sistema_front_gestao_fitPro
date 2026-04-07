"use client";

import React from "react";
import { DataTable } from "@/components/DataTable";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";
import { getConferenciaColumns } from "./columns";

interface ConferenciaTableItem {
	id: string;
	direcionamentoId: string;
	loteId: string;
	loteCodigo: string;
	faccaoNome?: string;
	dataConferencia: string;
	statusQualidade: "recebido" | "em_conferencia" | "aprovado" | "aprovado_parcial" | "aprovado_defeito";
	liberadoPagamento: boolean;
	observacao?: string;
	responsavel: { nome: string };
	items: Array<{
		tamanho?: { nome: string };
		qtdRecebida: number;
		qtdDefeito: number;
	}>;
}

interface ConferenciaTableProps {
	data: ConferenciaTableItem[];
	isLoading: boolean;
	onEdit: (item: ConferenciaTableItem) => void;
	onRemove: (id: string) => void;
}

export const ConferenciaTable: React.FC<ConferenciaTableProps> = ({
	data,
	isLoading,
	onEdit,
	onRemove,
}) => {
	const columns = React.useMemo(
		() => getConferenciaColumns({ onEdit, onRemove }),
		[onEdit, onRemove],
	);

	return (
		<div className="w-full">
			{data.length === 0 ? (
				<SemDadosComponent<ConferenciaTableItem> nomeDado="conferência" data={data} />
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

