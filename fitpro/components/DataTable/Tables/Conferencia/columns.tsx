import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Conferencia } from "@/types/production";
import { dataFormatter } from "@/utils/Formatter/data-brasil-format";
import { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, CheckCircle, Pencil, Trash2, XCircle } from "lucide-react";

interface ConferenciaColumnDeps {
	lotesMap: Record<string, string>;
	faccoesMap: Record<string, string>;
	onEdit: (item: Conferencia) => void;
	onRemove: (id: string) => void;
}

export const getConferenciaColumns = ({
	lotesMap,
	faccoesMap,
	onEdit,
	onRemove,
}: ConferenciaColumnDeps): ColumnDef<Conferencia>[] => [
	{
		accessorKey: "loteId",
		header: "Lote",
		cell: ({ row }) => (
			<span className="font-mono font-semibold">{lotesMap[row.original.loteId] || "-"}</span>
		),
	},
	{
		accessorKey: "dataConferencia",
		header: "Data",
		cell: ({ row }) => <span>{dataFormatter(new Date(row.original.dataConferencia))}</span>,
	},
	{
		accessorKey: "tipoProducao",
		header: "Origem",
		cell: ({ row }) => {
			if (row.original.tipoProducao === "faccao") {
				return <span>{faccoesMap[row.original.faccaoId || ""] || "Facção"}</span>;
			}
			return <span>Interna</span>;
		},
	},
	{
		accessorKey: "divergencia",
		header: "Divergência",
		cell: ({ row }) => (
			<StatusBadge status={row.original.divergencia ? "danger" : "success"}>
				{row.original.divergencia ? "Sim" : "Não"}
			</StatusBadge>
		),
	},
	{
		accessorKey: "avaliacaoQualidade",
		header: "Qualidade",
		cell: ({ row }) => {
			const qualityMap = {
				aprovado: { label: "Aprovado", type: "success" as const, Icon: CheckCircle },
				parcial: { label: "Parcial", type: "warning" as const, Icon: AlertCircle },
				reprovado: { label: "Reprovado", type: "danger" as const, Icon: XCircle },
				"": { label: "-", type: "neutral" as const, Icon: AlertCircle },
			};

			const quality = qualityMap[row.original.avaliacaoQualidade];
			return (
				<div className="flex items-center gap-1">
					<quality.Icon className="h-4 w-4" />
					<StatusBadge status={quality.type}>{quality.label}</StatusBadge>
				</div>
			);
		},
	},
	{
		accessorKey: "liberadoPagamento",
		header: "Pagamento",
		cell: ({ row }) => (
			<StatusBadge status={row.original.liberadoPagamento ? "success" : "neutral"}>
				{row.original.liberadoPagamento ? "Liberado" : "Pendente"}
			</StatusBadge>
		),
	},
	{
		id: "actions",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
					<Pencil className="h-4 w-4" />
				</Button>
				<Button variant="destructive" size="icon" onClick={() => onRemove(row.original.id)}>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>
		),
	},
];
