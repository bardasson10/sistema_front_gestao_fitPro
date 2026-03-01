"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { direcionamentoSchema, DirecionamentoFormValues } from "@/schemas/direcionamento-schema";
import { DirecionamentoForm } from "@/components/Forms/direcionamento-form";
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
  useDirecionamentos,
  useLotesProducao,
  useCriarDirecionamento,
  useAtualizarDirecionamento,
  useDeletarDirecionamento,
  useFaccoes,
} from "@/hooks/queries/useProducao";
import { DirecionamentoSchema } from "@/types/ProducaoDirecionamento/producao-direcionamento-type";
const initialValues: DirecionamentoFormValues = {
  tipoServico: "costura",
  faccaoId: "",
  produtos: [],
};

type LoteProdutos = {
  id: string;
  codigoLote?: string;
  items?: Array<{ produto?: { nome?: string }; quantidadePlanejada: number }>;
};

export default function Producao() {
  const { data: lotesData, isLoading: isLoadingLotes } = useLotesProducao();
  const lotes = lotesData?.data || [];
  const { data: direcionamentosData, isLoading: isLoadingDirecionamentos } = useDirecionamentos();
  const direcionamentos = direcionamentosData?.data || [];
  const { data: faccoesData } = useFaccoes("ativo");
  const faccoes = faccoesData || [];

  const { mutate: criarDirecionamento, isPending: isCreating } = useCriarDirecionamento();
  const { mutate: atualizarDirecionamento, isPending: isUpdating } = useAtualizarDirecionamento();
  const { mutate: deletarDirecionamento, isPending: isDeleting } = useDeletarDirecionamento();

  const [selectedLote, setSelectedLote] = useState<LoteProdutos | null>(null);

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

  const direcionamentosMap = useMemo(() => {
    return direcionamentos.reduce<Record<string, DirecionamentoSchema>>((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
  }, [direcionamentos]);

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
    return lotes
      .filter((item) => item.status === "planejado")
      .map((item) => {
        const totalPecas = (item.materiais || []).reduce(
          (acc, mat) => acc + (mat.cores?.flatMap((c) => c.gradeLote || []).reduce((gAcc, gItem) => gAcc + (gItem.quantidadePlanejada || 0), 0) || 0),
          0,
        );

        const totalProduto = (item.materiais?.flatMap((mat) => mat.cores || []) || []).flatMap((c) => c.gradeLote || []).length;

        return {
          loteId: item.id,
          loteCodigo: item.codigoLote || "-",
          totalPecas,
          totalProdutos: totalProduto,
          dataCriacao: item.createdAt,
        };
      });
  }, [lotes]);

  const getProdutosDisponiveis = (lote: LoteProdutos | null) => {
    if (!lote) return [];
    const produtosMap = new Map<string, { produto: string; total: number }>();

    (lote.items || []).forEach((item) => {
      const nomeProduto = item.produto?.nome || "Produto";
      const current = produtosMap.get(nomeProduto) || { produto: nomeProduto, total: 0 };
      produtosMap.set(nomeProduto, {
        produto: nomeProduto,
        total: current.total + (item.quantidadePlanejada || 0),
      });
    });

    return Array.from(produtosMap.values());
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
      produtos: getProdutosDisponiveis((direcionamentosMap[item.id]?.lote as LoteProdutos) || null).map((produto) => ({
        produto: produto.produto,
        quantidade: produto.total,
      })),
    }),
    onInvalid: () => {
      toast.error('Preencha os campos obrigatórios para criar o lote.');
      console.log('Form validation failed:', form.formState.errors);
    },
    onSave: (values, id) => {
      const produtosDirecionados = (values?.produtos || []).filter((p) => p.quantidade > 0);

      if (!produtosDirecionados.length) {
        toast.error("Selecione ao menos um produto para direcionar");
        return;
      }

      if (id) {
        const updatePayload: { id: string; faccaoId: string; tipoServico?: string } = {
          id,
          faccaoId: values.faccaoId,
        };
        updatePayload.tipoServico = values.tipoServico;

        atualizarDirecionamento(updatePayload as any);

        toast.success("Direcionamento atualizado com sucesso!");
        return;
      }

      if (!selectedLote) {
        toast.error("Lote não selecionado");
        return;
      }

      const createPayload: {
        loteProducaoId: string;
        faccaoId?: string;
        tipoServico: "costura" | "estampa" | "tingimento" | "acabamento" | "corte" | "outro";
      } = {
        loteProducaoId: selectedLote.id,
        tipoServico: values.tipoServico,
      };

      createPayload.faccaoId = values.faccaoId;

      criarDirecionamento(createPayload);

      toast.success("Direcionamento confirmado com sucesso!");
    },
  });

  const handleOpenDirecionar = (item: LoteProntoDirecionamentoItem) => {
    const loteSelecionado = (lotes.find((lote) => lote.id === item.loteId) as LoteProdutos) || null;
    setSelectedLote(loteSelecionado);

    form.reset({
      tipoServico: "costura",
      faccaoId: "",
      produtos: getProdutosDisponiveis(loteSelecionado).map((produto) => ({
        produto: produto.produto,
        quantidade: 0,
      })),
    });

    handleOpen();
  };

  const handleEditDirecionamento = (item: ProducaoDirecionamentoItem) => {
    const lote = (direcionamentosMap[item.id]?.lote as LoteProdutos) || null;
    setSelectedLote(lote);
    handleEdit(item);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Produção</h1>
        <p className="text-muted-foreground">
          Direcionamento e acompanhamento de produção
        </p>
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

      {/* Modal para direcionar */}
      <FormModal
        open={isOpen}
        onClose={handleClose}
        isViewSaveOrCancel={true}
        submitText={editingItem ? "Salvar Alterações" : "Confirmar Direcionamento"}
        onSubmit={onSubmit}
        title={`Direcionar Produção - ${selectedLote?.codigoLote || ""}`}
      >
        <Form {...form}>
          <DirecionamentoForm
            selectedLote={null}
            produtosDisponiveis={getProdutosDisponiveis(selectedLote)}
            faccoes={faccoes}
          />
        </Form>
      </FormModal>
    </div>
  );
}