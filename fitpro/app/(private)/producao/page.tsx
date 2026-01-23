'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoteProducao } from '@/types/production';
import {
  direcionamentoSchema,
  DirecionamentoFormValues,
} from '@/schemas/direcionamento-schema';
import { DirecionamentoForm } from '@/components/Forms/direcionamento-form';
import { FormModal } from '@/components/Modal/base-modal-form';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { ArrowRight, Factory, Home, CalendarDays } from 'lucide-react';
import { useFormModal } from '@/hooks/use-form-modal';
import { useProduction } from '@/providers/PrivateContexts/ProductionProvider';
import { dataFormatter } from '@/utils/Formatter/data-brasil-format';
import { toast } from 'sonner';


const initialValues: DirecionamentoFormValues = {
  tipoProducao: 'interna',
  faccaoId: '',
  produtos: [],
};

export default function Producao() {
  const { lotes, updateLote, faccoes } = useProduction();
  const [selectedLote, setSelectedLote] = useState<LoteProducao | null>(null);

  const form = useForm<DirecionamentoFormValues>({
    resolver: zodResolver(direcionamentoSchema),
    defaultValues: initialValues,
  });

  const handleSaveDirecionamento = useCallback((values: DirecionamentoFormValues) => {
    console.log('handleSaveDirecionamento chamado', values);
    
    if (!selectedLote) {
      console.log('Lote não selecionado');
      toast.error('Lote não selecionado');
      return;
    }

    const novoDirecionamento = {
      id: Math.random().toString(36).substr(2, 9),
      loteId: selectedLote.id,
      tipoProducao: values.tipoProducao as 'interna' | 'faccao',
      faccaoId: values.faccaoId,
      dataSaida: new Date(),
      produtos: values.produtos.filter((p) => p.quantidade > 0),
      status: 'em_producao' as const,
    };

    console.log('Novo direcionamento:', novoDirecionamento);
    console.log('Lote atual:', selectedLote);
    console.log('Direcionamentos atuais:', selectedLote.direcionamentos);

    updateLote(selectedLote.id, {
      status: 'em_producao',
      direcionamentos: [...selectedLote.direcionamentos, novoDirecionamento],
    });

    console.log('Lote atualizado!');
    toast.success('Direcionamento confirmado com sucesso!');
  }, [selectedLote, updateLote]);

  const { isOpen, handleOpen, handleClose, onSubmit } = useFormModal({
    form,
    initialValues,
    onSave: handleSaveDirecionamento,
  });

  const lotesDisponiveis = lotes.filter(
    (l) => l.status === 'cortado' || l.status === 'em_producao'
  );

  const handleOpenDirecionar = (lote: LoteProducao) => {
    setSelectedLote(lote);
    form.reset({
      tipoProducao: 'interna',
      faccaoId: '',
      produtos: lote.grade.map((g) => ({
        produto: g.produto,
        quantidade: 0,
      })),
    });
    handleOpen();
  };

  const getStatusDirecionamento = (
    direcionamento: any,
    faccao?: (typeof faccoes)[0]
  ) => {
    const hoje = new Date();
    const dataSaida = new Date(direcionamento.dataSaida);

    if (direcionamento.status === 'concluido')
      return { label: 'Concluído', type: 'success' as const };

    const prazoMedio = faccao?.prazoMedio || 7;
    const diasDesdeEnvio = Math.floor(
      (hoje.getTime() - dataSaida.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diasDesdeEnvio > prazoMedio)
      return { label: 'Atrasado', type: 'danger' as const };

    const diasRestantes = prazoMedio - diasDesdeEnvio;
    if (diasRestantes <= 2)
      return {
        label: `${diasRestantes}d restantes`,
        type: 'warning' as const,
      };

    return { label: 'Em Produção', type: 'info' as const };
  };

  const producaoAtiva = lotes.flatMap((lote) =>
    lote.direcionamentos
      .filter((d) => d.status !== 'concluido')
      .map((d) => ({
        ...d,
        lote,
        faccao: faccoes.find((f) => f.id === d.faccaoId),
      }))
  );

  const columns = [
    {
      key: 'lote',
      header: 'Lote',
      render: (item: (typeof producaoAtiva)[0]) => (
        <span className="font-mono font-semibold">{item.lote.codigo}</span>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (item: (typeof producaoAtiva)[0]) => (
        <div className="flex items-center gap-2">
          {item.tipoProducao === 'faccao' ? (
            <>
              <Factory className="h-4 w-4 text-muted-foreground" />
              <span>{item.faccao?.nome || 'Facção'}</span>
            </>
          ) : (
            <>
              <Home className="h-4 w-4 text-muted-foreground" />
              <span>Produção Interna</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'produtos',
      header: 'Produtos',
      render: (item: (typeof producaoAtiva)[0]) => (
        <span>{item.produtos.reduce((acc: number, p: any) => acc + p.quantidade, 0)} peças</span>
      ),
    },
    {
      key: 'dataSaida',
      header: 'Saída',
      render: (item: (typeof producaoAtiva)[0]) => (
        <span>{dataFormatter(new Date(item.dataSaida))}</span>
      ),
    },
    {
      key: 'prazo',
      header: 'Prazo Médio',
      render: (item: (typeof producaoAtiva)[0]) => (
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span>{item.faccao?.prazoMedio || 7} dias</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: (typeof producaoAtiva)[0]) => {
        const status = getStatusDirecionamento(item, item.faccao);
        return (
          <StatusBadge status={status.type}>{status.label}</StatusBadge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Produção</h1>
        <p className="text-muted-foreground">
          Direcionamento e acompanhamento de produção
        </p>
      </div>

      {/* Lotes para direcionar */}
      {lotesDisponiveis.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Lotes Prontos para Direcionamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lotesDisponiveis.map((lote) => (
                <div
                  key={lote.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-semibold">{lote.codigo}</span>
                    <span className="text-muted-foreground">
                      {lote.grade.reduce((acc, g) => acc + g.total, 0)} peças
                    </span>
                    <StatusBadge
                      status={lote.status === 'cortado' ? 'info' : 'warning'}
                    >
                      {lote.status === 'cortado' ? 'Aguardando' : 'Parcial'}
                    </StatusBadge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleOpenDirecionar(lote)}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Direcionar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Produções ativas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Produções em Andamento
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
                {producaoAtiva.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center p-8 text-muted-foreground"
                    >
                      Nenhuma produção em andamento
                    </td>
                  </tr>
                ) : (
                  producaoAtiva.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
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

      {/* Modal para direcionar */}
      <FormModal
        open={isOpen}
        onClose={handleClose}
        isViewSaveOrCancel={true}
        submitText='Confirmar Direcionamento'
        onSubmit={onSubmit}
        title={`Direcionar Produção - ${selectedLote?.codigo}`}
      >
        <Form {...form}>
          <DirecionamentoForm selectedLote={selectedLote} />
        </Form>
      </FormModal>
    </div>
  );
}