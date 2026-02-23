import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { dataFormatter } from "@/utils/Formatter/data-brasil-format";
import { ColumnDef } from "@tanstack/react-table";
import { CalendarDays, Factory, Pencil, Trash2 } from "lucide-react";

export interface ProducaoDirecionamentoItem {
	id: string;
	loteId: string;
	loteCodigo: string;
	tipoServico?: string;
	faccaoNome?: string;
	faccaoId?: string;
	totalPecas: number;
	dataSaida: string;
	prazoMedio: number;
	statusLabel: string;
	statusType: "success" | "danger" | "warning" | "info" | "neutral";
	produtos: { produto: string; quantidade: number }[];
}

export const getProducaoDirecionamentoColumns = (
	onEdit: (item: ProducaoDirecionamentoItem) => void,
	onRemove: (id: string) => void,
): ColumnDef<ProducaoDirecionamentoItem>[] => [
	{
		accessorKey: "loteCodigo",
		header: "Lote",
		cell: ({ row }) => <span className="font-mono font-semibold">{row.original.loteCodigo}</span>,
	},
	{
		accessorKey: "faccaoNome",
		header: "Facção",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Factory className="h-4 w-4 text-muted-foreground" />
				<span>{row.original.faccaoNome || "-"}</span>
			</div>
		),
	},
	{
		accessorKey: "totalPecas",
		header: "Produtos",
		cell: ({ row }) => <span>{row.original.totalPecas} peças</span>,
	},
	{
		accessorKey: "dataSaida",
		header: "Saída",
		cell: ({ row }) => <span>{dataFormatter(new Date(row.original.dataSaida))}</span>,
	},
	{
		accessorKey: "prazoMedio",
		header: "Prazo Médio",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<CalendarDays className="h-4 w-4 text-muted-foreground" />
				<span>{row.original.prazoMedio} dias</span>
			</div>
		),
	},
	{
		accessorKey: "statusLabel",
		header: "Status",
		cell: ({ row }) => (
			<StatusBadge status={row.original.statusType}>{row.original.statusLabel}</StatusBadge>
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
