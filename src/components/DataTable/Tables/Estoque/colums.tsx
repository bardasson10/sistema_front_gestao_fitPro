import { Button } from "@/components/ui/button";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { dataFormatter } from "@/utils/Formatter/data-brasil-format";
import { formatNumberToBRL } from "@/utils/Formatter/moeda-brasil-format";
import { parseNumber } from "@/utils/Formatter/parse-number-format";
import { EstoqueRolo } from "@/types/EstoqueRolo";
import { CircleColorView } from "@/components/ui/circle-color-view";


export const getStockColumns = (
  onEdit: (item: EstoqueRolo) => void,
  onRemove: ((id: string) => void) | undefined,
  canDelete: boolean,
  tecidos: { id: string; tipo: string; corId: string }[],
  cores: { id: string; nome: string; codigoHex: string }[],
): ColumnDef<EstoqueRolo>[] => [

    {
      accessorKey: 'identificacao',
      header: 'ID Rolo',
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.codigoBarraRolo}</span>,
    },
    {
      accessorKey: 'tecido',
      header: 'Tecido',
      cell: ({ row }) => {
        const corHex = row.original.tecido.cor.codigoHex; 
        const nomeTecido = row.original.tecido.nome;
        const nomeCor = row.original.tecido.cor.nome;

        return (
          <div className="flex items-center gap-2">
            <CircleColorView color={corHex} />
            <span>{nomeTecido} - {nomeCor}</span>
          </div>
        )
      },
    },
    {
      id: 'fornecedor',
      accessorKey: 'tecido',
      header: 'Fornecedor',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.tecido.fornecedor.nome}</span>,
    },
    {
      accessorKey: 'pesoAtualKg',
      header: 'Peso Atual (Kg)',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.pesoAtualKg}</span>,
    },
    {
      accessorKey: 'situacao',
      header: 'Situação',
      cell: ({ row }) => {
        const statusMap = {
          disponivel: { label: 'Disponível', type: 'success' as const },
          reservado: { label: 'Reservado', type: 'warning' as const },
          em_uso: { label: 'Em Uso', type: 'neutral' as const },
          utilizado: { label: 'Utilizado', type: 'neutral' as const },
          esgotado: { label: 'Esgotado', type: 'danger' as const },
          descartado: { label: 'Descartado', type: 'danger' as const },
        };
        const status = statusMap[row.original.situacao as keyof typeof statusMap] || { label: row.original.situacao, type: 'neutral' as const };
        return <StatusBadge status={status.type}>{status.label}</StatusBadge>
      }
    },
    {
      id: 'valorTecidoKg',
      accessorKey: 'tecido',
      header: 'Valor do tecido',
      cell: ({ row }) => <span className="text-muted-foreground">{formatNumberToBRL(row.original.tecido.valorPorKg)}</span>,
    },
    {
      id: 'valorTotal', // Use um ID único para colunas calculadas
      header: 'Valor Total',
      // accessorFn extrai o valor numérico para que a tabela consiga ordenar os valores
      accessorFn: (row) => {
        const valorPorKg = parseNumber(row.tecido.valorPorKg) ?? 0;
        const pesoAtualKg = parseNumber(row.pesoAtualKg) ?? 0;
        return valorPorKg * pesoAtualKg;
      },
      // cell formata a exibição para o usuário
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">
          {formatNumberToBRL(getValue<number>())}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Data de Criação',
      cell: ({ row }) => <span className="text-muted-foreground">{dataFormatter(row.original.createdAt)}</span>,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          {canDelete && onRemove && (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onRemove(row.original.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),

    },
  ];