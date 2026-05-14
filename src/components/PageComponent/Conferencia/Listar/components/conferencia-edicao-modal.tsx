'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Conferencia } from '@/types/Conferencia';
import { ConferenciaFormValues, conferenciaSchema } from '@/schemas/conferencia-schema';
import { BaseModal } from '@/components/Modal/base-modal';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ConferenciaForm } from '@/components/Forms/conferencia-form';
import { useAtualizarConferencia } from '@/hooks/queries/Conferencia/useConferencia';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

interface ConferenciaEdicaoModalProps {
    conferencia: Conferencia | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ConferenciaEdicaoModal({ conferencia, open, onOpenChange }: ConferenciaEdicaoModalProps) {
    const form = useForm<ConferenciaFormValues>({
        resolver: zodResolver(conferenciaSchema),
        defaultValues: {
            statusQualidade: 'recebido',
            liberadoPagamento: false,
            observacao: '',
            items: [],
        },
    });

    const atualizarConferencia = useAtualizarConferencia();

    useEffect(() => {
        if (conferencia && open) {
            // Transformar dados da conferência para o formato do formulário
            form.reset({
                statusQualidade: conferencia.statusQualidade,
                liberadoPagamento: conferencia.liberadoPagamento,
                observacao: conferencia.observacao || '',
                items: (conferencia.items || []).map((item) => ({
                    tamanhoId: item.tamanho || '',
                    qtdRecebida: item.qtdRecebida || 0,
                    qtdDefeito: item.qtdDefeito || 0,
                })),
            });
        }
    }, [conferencia, open, form]);

    const handleSubmit = form.handleSubmit((values) => {
        if (!conferencia) return;

        // Construir os dados de SKU para pagamento usando valores já existentes
        const skuPriceMap = new Map(
            (conferencia.pagamento?.porSku || []).map((item) => [
                item.sku,
                item.valorUnitario,
            ])
        );

        const skuPriceList = Array.from(
            new Set(conferencia.items.map((item) => item.produto.sku).filter((sku) => sku && sku !== '-'))
        ).map((sku) => ({
            sku,
            valorFaccaoPorPeca: skuPriceMap.get(sku) || 0,
        }));

        atualizarConferencia.mutate({
            id: conferencia.id,
            dados: {
                responsavelId: conferencia.responsavel.id,
                dataConferencia: conferencia.dataConferencia,
                statusQualidade: values.statusQualidade,
                produtoSKU: skuPriceList,
                liberadoPagamento: values.liberadoPagamento,
                observacao: values.observacao || '',
                items: values.items.map((item, index) => ({
                    direcionamentoItemId: conferencia.items[index]?.direcionamentoItemId || '',
                    qtdRecebida: item.qtdRecebida,
                    qtdDefeito: item.qtdDefeito,
                })),
            },
        });

        if (!atualizarConferencia.isPending) {
            onOpenChange(false);
        }
    });

    if (!conferencia) {
        return null;
    }

    return (
        <BaseModal
            open={open}
            onOpenChange={onOpenChange}
            title={`Editar Conferência - ${conferencia.direcionamento.faccao.nome}`}
            description="Atualize as informações de qualidade e quantidades"
        >
            <Form {...form}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <ConferenciaForm
                        items={(conferencia.items || []).map((item) => ({
                            tamanho: {
                                id: item.tamanho || '',
                                nome: item.tamanho || '-',
                            },
                            quantidadePlanejada: item.quantidadeEnviada,
                            qtdRecebida: item.qtdRecebida,
                            qtdDefeito: item.qtdDefeito,
                            produto: item.produto,
                            cor: item.cor,
                            lote: (item as any).lote || 'Sem Lote',
                        }))}
                    />

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={atualizarConferencia.isPending}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={atualizarConferencia.isPending}>
                            {atualizarConferencia.isPending ? <Spinner /> : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </Form>
        </BaseModal>
    );
}
