'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Direcionamento, Conferencia as ConferenciaType } from '@/types/production';
import {
  conferenciaSchema,
  ConferenciaFormValues,
} from '@/schemas/conferencia-schema';
import { ConferenciaForm } from '@/components/Forms/conferencia-form';
import { FormModal } from '@/components/Modal/base-modal-form';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  ClipboardCheck,
  Factory,
  Home,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { useFormModal } from '@/hooks/use-form-modal';
import { useProduction } from '@/providers/PrivateContexts/ProductionProvider';
import { dataFormatter } from '@/utils/Formatter/data-brasil-format';
import { toast } from 'sonner';

const initialValues: ConferenciaFormValues = {
  produtosRecebidos: [],
  avaliacaoQualidade: 'aprovado',
  observacoes: '',
};

export default function Conferencia() {
  const { lotes, updateLote, faccoes, conferencias, addConferencia } =
    useProduction();
  const [selectedDirecionamento, setSelectedDirecionamento] = useState<{
    direcionamento: Direcionamento;
    loteId: string;
    loteCodigo: string;
  } | null>(null);

  const form = useForm<ConferenciaFormValues>({
    resolver: zodResolver(conferenciaSchema),
    defaultValues: initialValues,
  });

  const handleSaveConferencia = useCallback(
    (values: ConferenciaFormValues) => {
      if (!selectedDirecionamento) {
        toast.error('Direcionamento não selecionado');
        return;
      }

      // Check for divergence
      const hasDivergencia = selectedDirecionamento.direcionamento.produtos.some(
        (p) => {
          const recebido = values.produtosRecebidos.find(
            (r) => r.produto === p.produto
          );
          return !recebido || recebido.quantidade !== p.quantidade;
        }
      );

      // Create conferencia record
      const dataEntrega = new Date();
      const novaConferencia: Omit<ConferenciaType, 'id'> = {
        loteId: selectedDirecionamento.loteId,
        direcionamentoId: selectedDirecionamento.direcionamento.id,
        faccaoId: selectedDirecionamento.direcionamento.faccaoId,
        tipoProducao: selectedDirecionamento.direcionamento.tipoProducao,
        produtosEsperados: selectedDirecionamento.direcionamento.produtos,
        produtosRecebidos: values.produtosRecebidos,
        divergencia: hasDivergencia,
        avaliacaoQualidade: values.avaliacaoQualidade,
        observacoes: values.observacoes || undefined,
        dataConferencia: dataEntrega,
        liberadoPagamento:
          values.avaliacaoQualidade === 'aprovado' && !hasDivergencia,
      };

      addConferencia(novaConferencia);

      // Update direcionamento status to concluded and set delivery date
      const lote = lotes.find((l) => l.id === selectedDirecionamento.loteId);
      if (lote) {
        const updatedDirecionamentos = lote.direcionamentos.map((d) =>
          d.id === selectedDirecionamento.direcionamento.id
            ? {
                ...d,
                status: 'concluido' as const,
                dataEntregaConferencia: dataEntrega,
              }
            : d
        );

        // Check if all direcionamentos are concluded
        const allConcluded = updatedDirecionamentos.every(
          (d) => d.status === 'concluido'
        );

        updateLote(selectedDirecionamento.loteId, {
          direcionamentos: updatedDirecionamentos,
          status: allConcluded ? 'concluido' : 'em_producao',
        });
      }

      toast.success('Conferência realizada com sucesso!');
    },
    [selectedDirecionamento, lotes, updateLote, addConferencia]
  );

  const { isOpen, handleOpen, handleClose, onSubmit } = useFormModal({
    form,
    initialValues,
    onSave: handleSaveConferencia,
  });

  // Get all productions pending conference
  const producoesParaConferir = lotes.flatMap((lote) =>
    lote.direcionamentos
      .filter((d) => d.status === 'em_producao' || d.status === 'atrasado')
      .map((d) => ({
        direcionamento: d,
        loteId: lote.id,
        loteCodigo: lote.codigo,
        faccao: faccoes.find((f) => f.id === d.faccaoId),
      }))
  );

  const handleOpenConferir = (item: (typeof producoesParaConferir)[0]) => {
    setSelectedDirecionamento({
      direcionamento: item.direcionamento,
      loteId: item.loteId,
      loteCodigo: item.loteCodigo,
    });
    form.reset({
      produtosRecebidos: item.direcionamento.produtos.map((p) => ({
        produto: p.produto,
        quantidade: p.quantidade,
      })),
      avaliacaoQualidade: 'aprovado',
      observacoes: '',
    });
    handleOpen();
  };

  const columns = [
    {
      key: 'lote',
      header: 'Lote',
      render: (item: (typeof producoesParaConferir)[0]) => (
        <span className="font-mono font-semibold">{item.loteCodigo}</span>
      ),
    },
    {
      key: 'tipo',
      header: 'Origem',
      render: (item: (typeof producoesParaConferir)[0]) => (
        <div className="flex items-center gap-2">
          {item.direcionamento.tipoProducao === 'faccao' ? (
            <>
              <Factory className="h-4 w-4 text-muted-foreground" />
              <span>{item.faccao?.nome || 'Facção'}</span>
            </>
          ) : (
            <>
              <Home className="h-4 w-4 text-muted-foreground" />
              <span>Interna</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'produtos',
      header: 'Produtos Esperados',
      render: (item: (typeof producoesParaConferir)[0]) => (
        <span>
          {item.direcionamento.produtos.reduce(
            (acc: number, p: any) => acc + p.quantidade,
            0
          )}{' '}
          peças
        </span>
      ),
    },
    {
      key: 'dataSaida',
      header: 'Saída',
      render: (item: (typeof producoesParaConferir)[0]) => (
        <span>{dataFormatter(new Date(item.direcionamento.dataSaida))}</span>
      ),
    },
    {
      key: 'prazo',
      header: 'Prazo Médio',
      render: (item: (typeof producoesParaConferir)[0]) => (
        <span>{item.faccao?.prazoMedio || 7} dias</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: (typeof producoesParaConferir)[0]) => {
        const hoje = new Date();
        const dataSaida = new Date(item.direcionamento.dataSaida);
        const prazoMedio = item.faccao?.prazoMedio || 7;
        const diasDesdeEnvio = Math.floor(
          (hoje.getTime() - dataSaida.getTime()) / (1000 * 60 * 60 * 24)
        );
        const isAtrasado = diasDesdeEnvio > prazoMedio;
        return (
          <StatusBadge status={isAtrasado ? 'danger' : 'warning'}>
            {isAtrasado ? 'Atrasado' : 'Aguardando'}
          </StatusBadge>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      render: (item: (typeof producoesParaConferir)[0]) => (
        <Button size="sm" onClick={() => handleOpenConferir(item)}>
          <ClipboardCheck className="h-4 w-4 mr-2" />
          Conferir
        </Button>
      ),
    },
  ];

  // Histórico de conferências
  const conferenciasColumns = [
    {
      key: 'lote',
      header: 'Lote',
      render: (item: ConferenciaType) => {
        const lote = lotes.find((l) => l.id === item.loteId);
        return (
          <span className="font-mono font-semibold">
            {lote?.codigo || '-'}
          </span>
        );
      },
    },
    {
      key: 'data',
      header: 'Data',
      render: (item: ConferenciaType) => (
        <span>{dataFormatter(new Date(item.dataConferencia))}</span>
      ),
    },
    {
      key: 'origem',
      header: 'Origem',
      render: (item: ConferenciaType) => {
        const faccao = faccoes.find((f) => f.id === item.faccaoId);
        return item.tipoProducao === 'faccao' ? faccao?.nome : 'Interna';
      },
    },
    {
      key: 'divergencia',
      header: 'Divergência',
      render: (item: ConferenciaType) => (
        <StatusBadge status={item.divergencia ? 'danger' : 'success'}>
          {item.divergencia ? 'Sim' : 'Não'}
        </StatusBadge>
      ),
    },
    {
      key: 'qualidade',
      header: 'Qualidade',
      render: (item: ConferenciaType) => {
        const map = {
          aprovado: {
            label: 'Aprovado',
            type: 'success' as const,
            icon: CheckCircle,
          },
          reprovado: {
            label: 'Reprovado',
            type: 'danger' as const,
            icon: XCircle,
          },
          parcial: {
            label: 'Parcial',
            type: 'warning' as const,
            icon: AlertCircle,
          },
        };
        const status = map[item.avaliacaoQualidade];
        const Icon = status.icon;
        return (
          <div className="flex items-center gap-1">
            <Icon className="h-4 w-4" />
            <StatusBadge status={status.type}>{status.label}</StatusBadge>
          </div>
        );
      },
    },
    {
      key: 'pagamento',
      header: 'Pagamento',
      render: (item: ConferenciaType) => (
        <StatusBadge status={item.liberadoPagamento ? 'success' : 'neutral'}>
          {item.liberadoPagamento ? 'Liberado' : 'Pendente'}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Conferência</h1>
        <p className="text-muted-foreground">
          Recebimento e conferência de produção
        </p>
      </div>

      {/* Pendentes */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
            Produções Aguardando Conferência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="text-left p-3 font-semibold text-muted-foreground"
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {producoesParaConferir.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center p-8 text-muted-foreground"
                    >
                      Nenhuma produção aguardando conferência
                    </td>
                  </tr>
                ) : (
                  producoesParaConferir.map((item) => (
                    <tr
                      key={item.direcionamento.id}
                      className="border-b hover:bg-muted/50"
                    >
                      {columns.map((col) => (
                        <td key={col.key} className="p-3">
                          {col.render(item)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Histórico */}
      {conferencias.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Histórico de Conferências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    {conferenciasColumns.map((col) => (
                      <th
                        key={col.key}
                        className="text-left p-3 font-semibold text-muted-foreground"
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {conferencias.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      {conferenciasColumns.map((col) => (
                        <td key={col.key} className="p-3">
                          {col.render(item)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Conferência */}
      <FormModal
        open={isOpen}
        onClose={handleClose}
        isViewSaveOrCancel={true}
        submitText="Confirmar Recebimento"
        onSubmit={onSubmit}
        title={`Conferência - ${selectedDirecionamento?.loteCodigo}`}
        Icon={<ClipboardCheck className="h-5 w-5" />}
      >
        <Form {...form}>
          <ConferenciaForm
            direcionamento={selectedDirecionamento?.direcionamento || null}
          />
        </Form>
      </FormModal>
    </div>
  );
}