import { Button } from "@/components/ui/button";
import { Produto, TiposProdutosSchema } from "@/hooks/queries/useProdutos";
import { dataFormatter } from "@/utils/Formatter/data-brasil-format";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

export const getProdutoColumns = (
	onEdit: (item: Produto) => void,
	onRemove: (id: string) => void,
	tiposProduto: TiposProdutosSchema[],
): ColumnDef<Produto>[] => [
	{
		accessorKey: "nome",
		header: "Nome",
		cell: ({ row }) => <span className="font-medium text-foreground">{row.original.nome}</span>,
	},
	{
		accessorKey: "tipoProdutoId",
		header: "Tipo",
		cell: ({ row }) => {
			const tipoNome =
				row.original.tipo?.nome || tiposProduto.find((item) => item.id === row.original.tipoProdutoId)?.nome;
			return <span className="text-muted-foreground">{tipoNome || "-"}</span>;
		},
	},
	{
		accessorKey: "sku",
		header: "SKU",
		cell: ({ row }) => <span className="text-muted-foreground">{row.original.sku}</span>,
	},
	{
		accessorKey: "fabricante",
		header: "Fabricante",
		cell: ({ row }) => <span className="text-muted-foreground">{row.original.fabricante}</span>,
	},
	{
		accessorKey: "custoMedioPeca",
		header: "Custo médio",
		cell: ({ row }) => (
			<span className="text-muted-foreground">{currencyFormatter.format(Number(row.original.custoMedioPeca) || 0)}</span>
		),
	},
	{
		accessorKey: "precoMedioVenda",
		header: "Preço médio",
		cell: ({ row }) => (
			<span className="text-muted-foreground">{currencyFormatter.format(Number(row.original.precoMedioVenda) || 0)}</span>
		),
	},
	{
		accessorKey: "createdAt",
		header: "Criado Em",
		cell: ({ row }) => <span className="text-muted-foreground">{dataFormatter(row.original.createdAt)}</span>,
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
