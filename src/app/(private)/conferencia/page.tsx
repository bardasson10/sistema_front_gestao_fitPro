'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { conferenciaSchema, ConferenciaFormValues } from '@/schemas/conferencia-schema';
import { ConferenciaForm } from '@/components/Forms/conferencia-form';
import { FormModal } from '@/components/Modal/base-modal-form';
import { Form } from '@/components/ui/form';
import { useFormModal } from '@/hooks/use-form-modal';
import { toast } from 'sonner';
import { RemoveItemWarning } from '@/components/ErrorManagementComponent/WarnningRemoveItem';
import { ConferenciaTable } from '@/components/DataTable/Tables/Conferencia/table';
import { MobileViewConferencia } from '@/components/MobileViewCards/ConferenciaCard';
import {
  useConferencias,
  useCriarConferencia,
  useAtualizarConferencia,
  useDeletarConferencia,
  useDirecionamentos,
  useAtualizarDirecionamento,
} from '@/hooks/queries/useProducao';
import { useAuth } from '@/hooks/use-auth';

interface ConferenciaTableItem {
  id: string;
  direcionamentoId: string;
  loteId: string;
  loteCodigo: string;
  faccaoNome?: string;
  dataConferencia: string;
  statusQualidade: 'conforme' | 'nao_conforme' | 'com_defeito' | 'validando';
  liberadoPagamento: boolean;
  observacao?: string;
  responsavel: { nome: string };
  items: Array<{
    tamanho?: { nome: string };
    qtdRecebida: number;
    qtdDefeito: number;
  }>;
}

const initialValues: ConferenciaFormValues = {
  statusQualidade: 'validando',
  liberadoPagamento: false,
  observacao: '',
  items: [],
};

export default function Conferencia() {
  const { user } = useAuth();
  const { data: conferenciaData, isLoading: isLoadingConferencias } = useConferencias();
  const conferencias = Array.isArray(conferenciaData) 
    ? conferenciaData 
    : (conferenciaData as any)?.data && Array.isArray((conferenciaData as any).data)
      ? (conferenciaData as any).data
      : [];

  const { data: direcionamentosData } = useDirecionamentos({ status: 'enviado' });
  const direcionamentos = direcionamentosData?.data || [];

  // Direcionamentos que ainda não têm conferência
  const conferenciasDirecionamentosIds = new Set(conferencias.map((c: any) => c.direcionamentoId));
  const conferenciasPendentes = direcionamentos.filter(
    (d: any) => !conferenciasDirecionamentosIds.has(d.id)
  );

  const { mutate: criarConferencia, isPending: isCreating } = useCriarConferencia();
  const { mutate: atualizarConferencia, isPending: isUpdating } = useAtualizarConferencia();
  const { mutate: deletarConferencia, isPending: isDeleting } = useDeletarConferencia();
  const { mutate: atualizarDirecionamento, isPending: isUpdatingDirecionamento } =
    useAtualizarDirecionamento();

  const [selectedDirecionamento, setSelectedDirecionamento] = useState<any>(null);

  const form = useForm<ConferenciaFormValues>({
    resolver: zodResolver(conferenciaSchema),
    defaultValues: initialValues,
  });

  // Mapa para status com cores
  const statusMap: Record<string, { label: string; color: string }> = {
    enviado: { label: 'Enviado', color: 'bg-blue-100 text-blue-800' },
    em_producao: { label: 'Em Produção', color: 'bg-yellow-100 text-yellow-800' },
    recebido: { label: 'Recebido', color: 'bg-green-100 text-green-800' },
    concluido: { label: 'Concluído', color: 'bg-purple-100 text-purple-800' },
  };

  const getTotalPecas = (lote: any) => {
    return (lote?.items || []).reduce((sum: number, item: any) => {
      return sum + (item.quantidadePlanejada || 0);
    }, 0);
  };

  const conferenciaTableData = useMemo<ConferenciaTableItem[]>(() => {
    return conferencias.map((conf: any) => ({
      id: conf.id,
      direcionamentoId: conf.direcionamentoId,
      loteId: conf.direcionamento?.lote?.id,
      loteCodigo: conf.direcionamento?.lote?.codigoLote || '-',
      faccaoNome: conf.direcionamento?.faccao?.nome,
      dataConferencia: conf.dataConferencia,
      statusQualidade: conf.statusQualidade,
      liberadoPagamento: conf.liberadoPagamento,
      observacao: conf.observacao,
      responsavel: conf.responsavel,
      items: conf.items || [],
    }));
  }, [conferencias]);

  const {
    isOpen,
    handleOpen,
    handleEdit,
    handleClose,
    handleRemove,
    removingItemId,
    isRemoveOpen,
    setIsRemoveOpen,
    editingItem,
    onSubmit,
    isSubmitting,
  } = useFormModal<ConferenciaFormValues, ConferenciaTableItem>({
    form,
    initialValues,
    transformItemToForm: (item) => ({
      statusQualidade: item.statusQualidade,
      liberadoPagamento: item.liberadoPagamento,
      observacao: item.observacao || '',
      items: item.items.map((it: any) => ({
        tamanhoId: it.tamanho?.id || it.tamanhoId || '',
        qtdRecebida: it.qtdRecebida,
        qtdDefeito: it.qtdDefeito,
      })),
    }),
    onInvalid: () => {
      toast.error('Preencha os campos obrigatórios para criar conferência.');
    },
    onSave: (values, id) => {
      if (!selectedDirecionamento && !id) {
        toast.error('Selecione um direcionamento');
        return;
      }

      if (id && editingItem) {
        atualizarConferencia({
          id,
          statusQualidade: values.statusQualidade,
          liberadoPagamento: values.liberadoPagamento,
          observacao: values.observacao,
          items: values.items,
        } as any);
        toast.success('Conferência atualizada com sucesso!');
        return;
      }

      criarConferencia({
        direcionamentoId: selectedDirecionamento.id,
        responsavelId: user?.id || '',
        dataConferencia: new Date().toISOString(),
        statusQualidade: values.statusQualidade,
        liberadoPagamento: values.liberadoPagamento,
        observacao: values.observacao,
        items: values.items,
      });
      toast.success('Conferência criada com sucesso!');
    },
  });

  const handleEditConferencia = (item: ConferenciaTableItem) => {
    // Seta o direcionamento para que o form tenha acesso aos tamanhos
    const conferenciasFound = conferencias.find((c: any) => c.id === item.id);
    if (conferenciasFound?.direcionamento) {
      setSelectedDirecionamento(conferenciasFound.direcionamento);
    }
    handleEdit(item);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Conferência</h1>
        <p className="text-muted-foreground">
          Recebimento e conferência de produção
        </p>
      </div>

      {/* Seção de Lotes Aguardando Conferência */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Lotes Aguardando Conferência</h2>
      </div>

      {direcionamentos.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {direcionamentos.map((item: any) => {
            const totalPecas = getTotalPecas(item.lote);
            return (
              <div
                key={item.id}
                className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Lote</p>
                      <p className="font-semibold text-lg">{item.lote?.codigoLote || '-'}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusMap[item.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                      {statusMap[item.status]?.label || item.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Facção</p>
                    <p className="font-medium">{item.faccao?.nome || '-'}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-muted-foreground">Peças Enviadas</p>
                    <p className="font-bold text-lg text-blue-600 dark:text-blue-400">{totalPecas} unidades</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Serviço</p>
                    <p className="font-medium capitalize">{item.tipoServico}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-muted-foreground">Saída</p>
                      <p className="font-medium">
                        {new Date(item.dataSaida).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Previsão</p>
                      <p className="font-medium">
                        {new Date(item.dataPrevisaoRetorno).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id={`recebido-${item.id}`}
                      onChange={(e) => {
                        if (e.target.checked) {
                          atualizarDirecionamento({
                            id: item.id,
                            status: 'recebido',
                          } as any);
                        }
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor={`recebido-${item.id}`} className="text-sm font-medium cursor-pointer">
                      Marcar como Finalizado
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">Nenhum lote aguardando conferência</p>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Conferências a Fazer</h2>
      </div>

      {conferenciasPendentes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {conferenciasPendentes.map((item: any) => {
            const totalPecas = getTotalPecas(item.lote);
            return (
              <div
                key={item.id}
                className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Lote</p>
                      <p className="font-semibold text-lg">{item.lote?.codigoLote || '-'}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusMap[item.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                      {statusMap[item.status]?.label || item.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Facção</p>
                    <p className="font-medium">{item.faccao?.nome || '-'}</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded border border-orange-200 dark:border-orange-800">
                    <p className="text-sm text-muted-foreground">Peças para Conferir</p>
                    <p className="font-bold text-lg text-orange-600 dark:text-orange-400">{totalPecas} unidades</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Serviço</p>
                    <p className="font-medium capitalize">{item.tipoServico}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-muted-foreground">Saída</p>
                      <p className="font-medium">
                        {new Date(item.dataSaida).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Previsão</p>
                      <p className="font-medium">
                        {new Date(item.dataPrevisaoRetorno).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDirecionamento(item);
                      form.reset(initialValues);
                      if (item.lote?.items) {
                        const items = item.lote.items.map((it: any) => ({
                          tamanhoId: it.tamanho?.id || '',
                          qtdRecebida: 0,
                          qtdDefeito: 0,
                        }));
                        form.setValue('items', items);
                      }
                      handleOpen();
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    Conferir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">Nenhuma conferência disponível</p>
        </div>
      )}

      <RemoveItemWarning
        id={removingItemId || ''}
        isOpen={isRemoveOpen}
        onClose={() => setIsRemoveOpen(false)}
        title="Deseja remover?"
        onConfirm={(id) => {
          deletarConferencia(id);
          toast.success('Conferência removida com sucesso!');
          setIsRemoveOpen(false);
        }}
      />

      {/* Modal para criar/editar conferência */}
      <FormModal
        open={isOpen}
        onClose={handleClose}
        isViewSaveOrCancel={true}
        submitText={editingItem ? 'Salvar Alterações' : 'Confirmar Conferência'}
        onSubmit={onSubmit}
        title={editingItem ? 'Editar Conferência' : 'Nova Conferência'}
      >
        <Form {...form}>
          {!editingItem ? (
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Selecione o Direcionamento
                </label>
                <select
                  value={selectedDirecionamento?.id || ''}
                  onChange={(e) => {
                    const direcId = e.target.value;
                    const selected = direcionamentos.find((d) => d.id === direcId);
                    setSelectedDirecionamento(selected);
                    if (selected && selected.lote?.items) {
                      const items = (selected.lote.items).map((item: any) => ({
                        tamanhoId: item.tamanho?.id || '',
                        qtdRecebida: 0,
                        qtdDefeito: 0,
                      }));
                      form.setValue('items', items);
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="">-- Selecione --</option>
                  {direcionamentos.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      Lote {d.lote?.codigoLote} - {d.faccao?.nome}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDirecionamento && (
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Peças Enviadas</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {getTotalPecas(selectedDirecionamento.lote)} unidades
                  </p>
                </div>
              )}

              {selectedDirecionamento && selectedDirecionamento.lote?.items && (
                <ConferenciaForm
                  items={selectedDirecionamento.lote.items}
                />
              )}
            </div>
          ) : (
            <ConferenciaForm
              items={
                selectedDirecionamento?.lote?.items || []
              }
            />
          )}
        </Form>
      </FormModal>
    </div>
  );
}