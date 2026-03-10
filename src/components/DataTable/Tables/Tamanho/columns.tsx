import { Button } from "@/components/ui/button";
import { Tamanho } from "@/hooks/queries/useProdutos";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export const getTamanhoColumns = (
	onEdit: (item: Tamanho) => void,
	onRemove: (id: string) => void,
): ColumnDef<Tamanho>[] => [
	{
		accessorKey: "nome",
		header: "Nome",
		cell: ({ row }) => <span className="font-medium text-foreground">{row.original.nome}</span>,
	},
	{
		accessorKey: "ordem",
		header: "Ordem",
		cell: ({ row }) => (
			<span className="text-muted-foreground">{row.original.ordem}</span>
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
