import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { TiposProdutosSchema } from "@/hooks/queries/useProdutos";
import { dataFormatter } from "@/utils/Formatter/data-brasil-format";
import { Link2 } from "lucide-react";

export const getTiposProdutoColumns = (
	onAssociate: (item: TiposProdutosSchema) => void,
): ColumnDef<TiposProdutosSchema>[] => [
	{
		accessorKey: 'nome',
		header: 'Nome',
		cell: ({ row }) => <span className="font-medium text-foreground">{row.original.nome}</span>,
	},
	{
		accessorKey: 'tamanhos',
		header: 'Tamanhos',
		cell: ({ row }) => (
			<span className="text-muted-foreground">
				{row.original.tamanhos?.length
					? row.original.tamanhos.map((tamanho) => tamanho.NomeTamanho).join(", ")
					: "Sem tamanhos"}
			</span>
		),
	},
	{
		accessorKey: 'createdAt',
		header: 'Criado Em',
		cell: ({ row }) => (
			<span className="text-muted-foreground">{dataFormatter(row.original.createdAt)}</span>
		),
	},
	{
		id: 'actions',
		cell: ({ row }) => (
			<Button
				variant="outline"
				size="sm"
				onClick={() => onAssociate(row.original)}
			>
				<Link2 className="mr-2 h-4 w-4" />
				Associar tamanhos
			</Button>
		),
	},
];
