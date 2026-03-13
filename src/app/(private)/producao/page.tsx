"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { direcionamentoSchema, DirecionamentoFormValues } from "@/schemas/direcionamento-schema";
import { DirecionamentoForm } from "@/components/Forms/DirecionamentoProducao/direcionamento-form";
import { FormModal } from "@/components/Modal/base-modal-form";
import { Form } from "@/components/ui/form";
import { useFormModal } from "@/hooks/use-form-modal";
import { toast } from "sonner";
import { RemoveItemWarning } from "@/components/ErrorManagementComponent/WarnningRemoveItem";
import {
  LoteProntoDirecionamentoItem,
  LotesProntosDirecionamentoSection,
} from "@/components/Conferencia/LotesProntosDirecionamentoSection";
import { ProducaoDirecionamentoItem } from "@/components/DataTable/Tables/ProducaoDirecionamento/columns";
import { ProducaoDirecionamentoTable } from "@/components/DataTable/Tables/ProducaoDirecionamento/table";
import { MobileViewProducaoDirecionamento } from "@/components/MobileViewCards/ProducaoDirecionamentoCard";
import {
  ApiLoteProducaoResponse,
  CreateDirecionamentoPayload,
  useDirecionamentos,
  useLotesProducao,
  useCriarDirecionamento,
  useAtualizarDirecionamento,
  useDeletarDirecionamento,
  useFaccoes,
} from "@/hooks/queries/useProducao";

const getNowISO = () => new Date().toISOString();

const initialValues: DirecionamentoFormValues = {
  tipoServico: "costura",
  faccaoId: "",
  direcionamentos: [
    {
      faccaoId: "",
      tipoServico: "costura",
      quantidade: 1,
      dataSaida: getNowISO(),
      dataPrevisaoRetorno: getNowISO(),
      items: [],
    },
  ],
  produtos: [],
};

export default function Producao() {
  const { data: lotesData = { data: [], pagination: {} } } = useLotesProducao();
  const dataLote = lotesData.data || [];

  const { data: direcionamentosData, isLoading: isLoadingDirecionamentos } = useDirecionamentos();
  const direcionamentos = (direcionamentosData?.data || []).filter((dir) =>
    (dir.lote?.items || []).some((item) => (item.quantidadePlanejada || 0) > 0),
  );
  const { data: faccoesData } = useFaccoes("ativo");
  const faccoes = faccoesData || [];

  const { mutate: criarDirecionamento, isPending: isCreating } = useCriarDirecionamento();
  const { mutate: atualizarDirecionamento } = useAtualizarDirecionamento();
  const { mutate: deletarDirecionamento } = useDeletarDirecionamento();

  const [selectedLote, setSelectedLote] = useState<ApiLoteProducaoResponse | undefined>(undefined);

  const form = useForm<DirecionamentoFormValues>({
    resolver: zodResolver(direcionamentoSchema),
    defaultValues: initialValues,
  });

  const getStatusDirecionamento = (dataSaida: string, status: string, prazoMedio: number) => {
    if (status === "concluido") {
      return { label: "Concluído", type: "success" as const };
    }

    const hoje = new Date();
    const dataSaidaDate = new Date(dataSaida);
    const diasDesdeEnvio = Math.floor(
      (hoje.getTime() - dataSaidaDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diasDesdeEnvio > prazoMedio) {
      return { label: "Atrasado", type: "danger" as const };
    }

    const diasRestantes = prazoMedio - diasDesdeEnvio;
    if (diasRestantes <= 2) {
      return { label: `${diasRestantes}d restantes`, type: "warning" as const };
    }

    return { label: "Em Produção", type: "info" as const };
  };

  const producaoAtiva = useMemo<ProducaoDirecionamentoItem[]>(() => {
    return direcionamentos
      .filter((item) => item.status !== "concluido")
      .map((item) => {
        const faccao = faccoes.find((f) => f.id === item.faccaoId) || item.faccao;
        const prazoMedio = faccao?.prazoMedioDias || 7;
        const totalPecas = (item.lote?.items || []).reduce(
          (acc, loteItem) => acc + (loteItem.quantidadePlanejada || 0),
          0,
        );
        const status = getStatusDirecionamento(item.dataSaida, item.status, prazoMedio);

        return {
          id: item.id,
          loteId: item.lote?.id || item.loteProducaoId,
          loteCodigo: item.lote?.codigoLote || "-",
          tipoServico: item.tipoServico,
          faccaoNome: faccao?.nome,
          faccaoId: item.faccaoId,
          totalPecas,
          dataSaida: item.dataSaida,
          prazoMedio,
          statusLabel: status.label,
          statusType: status.type,
          produtos: (item.lote?.items || []).map((loteItem) => ({
            produto: loteItem.produto?.nome || "",
            quantidade: loteItem.quantidadePlanejada,
          })),
        };
      });
  }, [direcionamentos, faccoes]);

  const lotesProntosParaDirecionar = useMemo<LoteProntoDirecionamentoItem[]>(() => {
    return dataLote
      .filter((item) => item.status === "planejado")
      .map((item) => {
        const totalPecas = (item.materiais || []).reduce(
          (acc, mat) =>
            acc +
            (mat.cores
              ?.flatMap((c) => c.gradeLote || [])
              .reduce((gAcc, gItem) => gAcc + (gItem.quantidadePlanejada || 0), 0) || 0),
          0,
        );

        const totalProdutos =
          (item.materiais?.flatMap((mat) => mat.cores || []) || []).flatMap(
            (c) => c.gradeLote || [],
          ).length;

        return {
          loteId: item.id,
          loteCodigo: item.codigoLote || "-",
          totalPecas,
          totalProdutos,
          dataCriacao: item.createdAt,
        };
      })
      .filter((item) => item.totalProdutos > 0 && item.totalPecas > 0);
  }, [dataLote]);

  const getProdutosDisponiveis = (lote?: ApiLoteProducaoResponse) => {
    if (!lote?.materiais?.length) return [];

    const produtosMap = new Map<string, { id?: string; produto?: string; total: number }>();

    lote.materiais.forEach((material) => {
      (material.cores || []).forEach((cor) => {
        (cor.gradeLote || []).forEach((gradeItem) => {
          const produtoId = gradeItem.produtoId || gradeItem.produto?.id;
          const produtoNome =
            gradeItem.produto?.tipoProdutoId || gradeItem.produtoNome || gradeItem.produto?.nome;

          if (!produtoNome) return;

          const mapKey = produtoId || produtoNome;
          const current = produtosMap.get(mapKey) || {
            id: produtoId,
            produto: produtoNome,
            total: 0,
          };

          produtosMap.set(mapKey, {
            id: current.id || produtoId,
            produto: current.produto || produtoNome,
            total: current.total + (gradeItem.quantidadePlanejada || 0),
          });
        });
      });
    });

    return Array.from(produtosMap.values());
  };

  const addDaysISO = (baseDateISO: string, days: number) => {
    const data = new Date(baseDateISO);
    data.setDate(data.getDate() + days);
    return data.toISOString();
  };

  const getPrazoMedioDias = (faccaoId?: string) => {
    if (!faccaoId) return 7;
    const faccao = faccoes.find((item) => item.id === faccaoId);
    return faccao?.prazoMedioDias || faccao?.prazoMedio || 7;
  };

  const getSaldoDisponivelPorGrade = (lote: ApiLoteProducaoResponse) => {
    const saldoMap = new Map<string, number>();

    (lote.materiais || []).forEach((material) => {
      (material.cores || []).forEach((cor) => {
        if (!cor.corId) return;
        (cor.gradeLote || []).forEach((item) => {
          if (!item.produtoId || !item.tamanhoId) return;

          const key = `${cor.corId}:${item.produtoId}:${item.tamanhoId}`;
          saldoMap.set(key, (saldoMap.get(key) || 0) + (item.quantidadePlanejada || 0));
        });
      });
    });

    return saldoMap;
  };

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
  } = useFormModal<DirecionamentoFormValues, ProducaoDirecionamentoItem>({
    form,
    initialValues,
    transformItemToForm: (item) => ({
      faccaoId: item.faccaoId || "",
      tipoServico: (item.tipoServico as DirecionamentoFormValues["tipoServico"]) || "costura",
      direcionamentos: [
        {
          faccaoId: item.faccaoId || "",
          tipoServico: (item.tipoServico as DirecionamentoFormValues["tipoServico"]) || "costura",
          quantidade: item.totalPecas || 1,
          dataSaida: item.dataSaida || getNowISO(),
          dataPrevisaoRetorno: addDaysISO(
            item.dataSaida || getNowISO(),
            item.prazoMedio || getPrazoMedioDias(item.faccaoId),
          ),
          items: [],
        },
      ],
      produtos: (item.produtos || []).map((produto) => ({
        produto: produto.produto,
        quantidade: produto.quantidade,
      })),
    }),
    onInvalid: () => {
      toast.error("Preencha os campos obrigatórios para criar o direcionamento.");
    },
    onSave: (values, id) => {
      if (id) {
        const faccaoId = values.faccaoId || values.direcionamentos?.[0]?.faccaoId || "";
        const tipoServico = values.tipoServico || values.direcionamentos?.[0]?.tipoServico;

        if (!faccaoId || !tipoServico) {
          toast.error("Selecione facção e tipo de serviço para atualizar.");
          return;
        }

        atualizarDirecionamento({
          id,
          faccaoId,
          tipoServico,
        });

        toast.success("Direcionamento atualizado com sucesso!");
        return;
      }

      if (!selectedLote) {
        toast.error("Lote não selecionado");
        return;
      }

      const saldoDisponivelMap = getSaldoDisponivelPorGrade(selectedLote);

      const direcionamentosPayload = (values.direcionamentos || [])
        .map((direcionamento) => {
          const prazoMedio = getPrazoMedioDias(direcionamento.faccaoId);
          const dataSaida = direcionamento.dataSaida || getNowISO();
          const dataPrevisaoRetorno =
            direcionamento.dataPrevisaoRetorno || addDaysISO(dataSaida, prazoMedio);

          const items = (direcionamento.items || [])
            .filter((item) => item.quantidade > 0)
            .map((item) => ({
              corId: item.corId,
              produtoId: item.produtoId,
              tamanhoId: item.tamanhoId,
              quantidade: item.quantidade,
            }));

          return {
            faccaoId: direcionamento.faccaoId,
            tipoServico: direcionamento.tipoServico,
            dataSaida,
            dataPrevisaoRetorno,
            items,
          };
        })
        .filter((direcionamento) =>
          Boolean(direcionamento.faccaoId && direcionamento.tipoServico && direcionamento.items.length > 0),
        );

      if (!direcionamentosPayload.length) {
        toast.error("Adicione ao menos um direcionamento válido com itens selecionados.");
        return;
      }

      const totalEnviadoMap = new Map<string, number>();
      direcionamentosPayload.forEach((direcionamento) => {
        direcionamento.items.forEach((item) => {
          const key = `${item.corId}:${item.produtoId}:${item.tamanhoId}`;
          totalEnviadoMap.set(key, (totalEnviadoMap.get(key) || 0) + item.quantidade);
        });
      });

      for (const [key, quantidadeTotal] of totalEnviadoMap.entries()) {
        const disponivel = saldoDisponivelMap.get(key) || 0;
        if (quantidadeTotal > disponivel) {
          toast.error("A soma das quantidades por produto/tamanho não pode ultrapassar o disponível do lote.");
          return;
        }
      }

      const createPayload: CreateDirecionamentoPayload = {
        loteProducaoId: selectedLote.id,
        direcionamentos: direcionamentosPayload,
      };

      criarDirecionamento(createPayload);
      toast.success("Direcionamento confirmado com sucesso!");
    },
  });

  const handleOpenDirecionar = (item: LoteProntoDirecionamentoItem) => {
    const loteSelecionado = dataLote.find((lote) => lote.id === item.loteId);
    setSelectedLote(loteSelecionado);

    const quantidadeTotalLote = getProdutosDisponiveis(loteSelecionado).reduce(
      (acc, produto) => acc + (produto.total || 0),
      0,
    );

    form.reset({
      tipoServico: "costura",
      faccaoId: "",
      direcionamentos: [
        {
          faccaoId: "",
          tipoServico: "costura",
          quantidade: quantidadeTotalLote > 0 ? quantidadeTotalLote : 1,
          dataSaida: getNowISO(),
          dataPrevisaoRetorno: addDaysISO(getNowISO(), 7),
          items: [],
        },
      ],
      produtos: getProdutosDisponiveis(loteSelecionado).map((produto) => ({
        produto: produto.produto,
        quantidade: 0,
      })),
    });

    handleOpen();
  };

  const handleEditDirecionamento = (item: ProducaoDirecionamentoItem) => {
    const lote = dataLote.find((loteItem) => loteItem.id === item.loteId);
    setSelectedLote(lote);
    handleEdit(item);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Produção</h1>
        <p className="text-muted-foreground">Direcionamento e acompanhamento de produção</p>
      </div>

      <LotesProntosDirecionamentoSection
        itens={lotesProntosParaDirecionar}
        onDirecionar={handleOpenDirecionar}
      />

      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Produções em Andamento</h2>
      </div>

      <div className="hidden md:block">
        <ProducaoDirecionamentoTable
          data={producaoAtiva}
          isLoading={isSubmitting || isLoadingDirecionamentos}
          onEdit={handleEditDirecionamento}
          onRemove={handleRemove}
        />
      </div>

      <div className="block md:hidden">
        <MobileViewProducaoDirecionamento
          data={producaoAtiva}
          isLoading={isSubmitting || isLoadingDirecionamentos}
          onEdit={handleEditDirecionamento}
          onRemove={handleRemove}
        />
      </div>

      <RemoveItemWarning
        id={removingItemId || ""}
        isOpen={isRemoveOpen}
        onClose={() => setIsRemoveOpen(false)}
        title="Deseja remover?"
        onConfirm={(id) => {
          deletarDirecionamento(id);
          toast.success("Direcionamento removido com sucesso!");
          setIsRemoveOpen(false);
        }}
      />

      <FormModal
        open={isOpen}
        onClose={handleClose}
        isViewSaveOrCancel={true}
        loading={isSubmitting || isCreating}
        submitText={editingItem ? "Salvar Alterações" : "Confirmar Direcionamento"}
        onSubmit={onSubmit}
        title={`Direcionar Produção - ${selectedLote?.codigoLote || ""}`}
      >
        <Form {...form}>
          <DirecionamentoForm
            selectedLote={selectedLote}
            produtosDisponiveis={getProdutosDisponiveis(selectedLote)}
            faccoes={faccoes}
            isCreateMode={!editingItem}
            numPecas={lotesProntosParaDirecionar.find((l) => l.loteId === selectedLote?.id)?.totalPecas || 0}
          />
        </Form>
      </FormModal>
    </div>
  );
}
