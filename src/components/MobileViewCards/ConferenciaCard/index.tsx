import { BaseCard } from "@/components/MobileViewCards/base-card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { dataFormatter } from "@/utils/Formatter/data-brasil-format";
import { AlertCircle, CheckCircle, Pencil, Trash2, XCircle } from "lucide-react";

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

interface MobileViewConferenciaProps {
	data: ConferenciaTableItem[];
	isLoading: boolean;
	onEdit: (item: ConferenciaTableItem) => void;
	onRemove: (id: string) => void;
}

export const MobileViewConferencia = ({
	data,
	isLoading,
	onEdit,
	onRemove,
}: MobileViewConferenciaProps) => {
	if (isLoading) {
		return (
			<div className="flex flex-col gap-4 p-4">
				{[1, 2, 3].map((index) => (
					<div key={index} className="h-32 w-full animate-pulse rounded-lg bg-muted" />
				))}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 p-4">
			{data.length === 0 && (
				<p className="text-center text-sm text-muted-foreground">
					Nenhuma conferência realizada
				</p>
			)}
			{data.map((item) => {
				const qualityMap = {
					recebido: { label: "Recebido", type: "neutral" as const, Icon: CheckCircle },
					em_conferencia: { label: "Em Conferência", type: "warning" as const, Icon: AlertCircle },
					aprovado: { label: "Aprovado", type: "success" as const, Icon: CheckCircle },
					aprovado_parcial: { label: "Aprovado Parcial", type: "warning" as const, Icon: AlertCircle },
					aprovado_defeito: { label: "Aprovado Defeito", type: "danger" as const, Icon: XCircle },
				};

				const quality = qualityMap[item.statusQualidade];

				return (
					<BaseCard
						key={item.id}
						title={`Lote ${item.loteCodigo || "-"}`}
						cardClassName="min-h-fit"
						headerClassName="pb-2"
						action={
							<StatusBadge status={quality.type}>
								{quality.label}
							</StatusBadge>
						}
						content={
							<div className="grid gap-2 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Data:</span>
									<span className="font-medium">{dataFormatter(new Date(item.dataConferencia))}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Facção:</span>
									<span className="font-medium">{item.faccaoNome || "-"}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Responsável:</span>
									<span className="font-medium">{item.responsavel?.nome || "-"}</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-muted-foreground">Pagamento:</span>
									<StatusBadge status={item.liberadoPagamento ? "success" : "warning"}>
										{item.liberadoPagamento ? "Liberado" : "Pendente"}
									</StatusBadge>
								</div>
								{item.observacao && (
									<div className="mt-2 pt-2 border-t">
										<p className="text-xs text-muted-foreground">{item.observacao}</p>
									</div>
								)}
							</div>
						}
						footer={
							<div className="flex w-full gap-2">
								<Button variant="outline" className="flex-1" onClick={() => onEdit(item)}>
									<Pencil className="mr-2 h-4 w-4" />
									Editar
								</Button>
								<Button variant="destructive" size="icon" onClick={() => onRemove(item.id)}>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						}
						footerClassName="border-t bg-muted/50 px-6 py-3"
					/>
				);
			})}
		</div>
	);
};