import { Button } from "@/components/ui/button";
import { Cor } from "@/types/production";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export const getCoresColumns = (
	onEdit: (item: Cor) => void,
	onRemove: (id: string) => void,
): ColumnDef<Cor>[] => [
	{
		accessorKey: "nome",
		header: "Nome",
		cell: ({ row }) => <span className="font-medium text-foreground">{row.original.nome}</span>,
	},
	{
		accessorKey: "codigoHex",
		header: "Cor / HEX",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<div
					className="h-5 w-5 rounded border"
					style={{ backgroundColor: row.original.codigoHex }}
				/>
				<span className="text-muted-foreground">{row.original.codigoHex}</span>
			</div>
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
