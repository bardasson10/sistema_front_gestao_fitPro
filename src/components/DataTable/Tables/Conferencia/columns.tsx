import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { dataFormatter } from "@/utils/Formatter/data-brasil-format";
import { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, CheckCircle, Trash2, XCircle } from "lucide-react";

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

interface ConferenciaColumnDeps {
	onEdit: (item: ConferenciaTableItem) => void;
	onRemove: (id: string) => void;
}

export const getConferenciaColumns = ({
	onEdit,
	onRemove,
}: ConferenciaColumnDeps): ColumnDef<ConferenciaTableItem>[] => [
	{
		accessorKey: "loteCodigo",
		header: "Lote",
		cell: ({ row }) => (
			<span className="font-mono font-semibold">{row.original.loteCodigo || "-"}</span>
		),
	},
	{
		accessorKey: "faccaoNome",
		header: "Facção",
		cell: ({ row }) => (
			<span>{row.original.faccaoNome || "-"}</span>
		),
	},
	{
		accessorKey: "dataConferencia",
		header: "Data",
		cell: ({ row }) => <span>{dataFormatter(new Date(row.original.dataConferencia))}</span>,
	},
	{
		accessorKey: "responsavel",
		header: "Responsável",
		cell: ({ row }) => (
			<span>{row.original.responsavel?.nome || "-"}</span>
		),
	},
	{
		accessorKey: "statusQualidade",
		header: "Qualidade",
		cell: ({ row }) => {
			const qualityMap: Record<string, { label: string; type: "success" | "danger" | "warning" | "neutral"; Icon: any }> = {
				recebido: { label: "Recebido", type: "neutral", Icon: CheckCircle },
				em_conferencia: { label: "Em Conferência", type: "warning", Icon: AlertCircle },
				aprovado: { label: "Aprovado", type: "success", Icon: CheckCircle },
				aprovado_parcial: { label: "Aprovado Parcial", type: "warning", Icon: AlertCircle },
				aprovado_defeito: { label: "Aprovado Defeito", type: "danger", Icon: XCircle },
			};

			const quality = qualityMap[row.original.statusQualidade] || {
				label: "-",
				type: "neutral" as const,
				Icon: AlertCircle,
			};
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
			<StatusBadge status={row.original.liberadoPagamento ? "success" : "warning"}>
				{row.original.liberadoPagamento ? "Liberado" : "Pendente"}
			</StatusBadge>
		),
	},
	{
		id: "actions",
		header: "Ações",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Button 
					onClick={() => onEdit(row.original)}
					className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-3"
				>
					Conferir
				</Button>
				<Button variant="destructive" size="icon" onClick={() => onRemove(row.original.id)}>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>
		),
	},
];
