'use client';

import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Layers, Package, Plus, Weight } from "lucide-react";

import { MetricCard } from "@/components/ui/metric-card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { StockTable } from "@/components/DataTable/Tables/Estoque/table";
import { ResumeStockTable } from "@/components/DataTable/Tables/Estoque/resume-table";
import { MovementStockTable } from "@/components/DataTable/Tables/Estoque/MovimentacaoEstoque/table";

import { FormModal } from "@/components/Modal/base-modal-form";
import { StockFabricForm } from "@/components/Forms/stock-fabric-form";
import { EstoqueRoloFilters } from "@/components/Forms/estoque-rolo-filters";
import { RemoveItemWarning } from "@/components/ErrorManagementComponent/WarnningRemoveItem";

import { MobileViewStock } from "@/components/MobileViewCards/StockCard/stock-card";
import { MobileViewStockResume } from "@/components/MobileViewCards/StockCard/stock-card-resume";
import { MobileViewStockMovement } from "@/components/MobileViewCards/StockCard/stock-card-movement";

import { useFormModal } from "@/hooks/use-form-modal";
import { usePagination } from "@/hooks/use-pagination";
import { useAuth } from "@/hooks/use-auth";
import { 
  useAtualizarEstoqueTecido, 
  useCriarEstoqueTecido, 
  useDeletarEstoqueTecido 
} from "@/hooks/queries/useEstoque";
import { useCores, useTecidos } from "@/hooks/queries/useMateriais";
import { 
  useGetKPIsEstoqueRolo, 
  useGetListAllEstoqueRolo, 
  useGetListAllEstoqueRoloCompleto, 
  useGetResumeEstoqueRolo 
} from "@/hooks/queries/Estoque/useEstoque-Rolo";
import { useGetListAllMovimentacoesEstoque } from "@/hooks/queries/Estoque/useEstoque-Rolo-Movimentacao";

import { RoloTecidoFormValues, roloTecidoSchema } from "@/schemas/rolo-tecido-schema";
import { parseNumber } from "@/utils/Formatter/parse-number-format";
import { formatNumberToBRL } from "@/utils/Formatter/moeda-brasil-format";
import { EstoqueRolo, IFiltroEstoqueRolo, IMovimentacaoRolo } from "@/types/EstoqueRolo";

const getTodayDate = () => new Date().toISOString().split("T")[0];

const normalizeSituacaoForApi = (situacao: RoloTecidoFormValues["situacao"]) => {
  if (situacao === "esgotado") return "descartado" as const;
  if (!situacao) return "disponivel" as const;
  return situacao;
};

const normalizeSituacaoForForm = (situacao: string): RoloTecidoFormValues["situacao"] => {
  if (situacao === "esgotado") return "descartado";
  const validas = ["disponivel", "reservado", "em_uso", "descartado"];
  return validas.includes(situacao) ? (situacao as any) : "disponivel";
};

const initialValues: RoloTecidoFormValues = {
  tecidoId: "",
  prefixo: "",
  dataLote: getTodayDate(),
  rolos: [{ pesoInicialKg: 0 }],
  codigoBarraRolo: "",
  pesoAtualKg: 0,
  situacao: "disponivel",
};

export default function Estoque() {
  const { user } = useAuth();
  const isAdmin = user.perfil === "ADM";
  
  const [activeTab, setActiveTab] = useState("rolos-individuais");
  const [filtros, setFiltros] = useState<IFiltroEstoqueRolo>({});

  const {
    page,
    limit: pageSize,
    setPage,
    setPageSize,
  } = usePagination();

  const isTabRolos = activeTab === "rolos-individuais";
  const isTabResumo = activeTab === "resumo-por-tecido";
  const isTabMovimentacao = activeTab === "movimentacao-do-estoque";

  const { data: tecidosResponse } = useTecidos();
  const tecidos = tecidosResponse?.data || [];
  const { data: coresData } = useCores();
  const cores = coresData || [];

  const rolosQuery = useMemo(() => ({
    ...filtros,
    page: page,
    limit: pageSize
  }), [filtros, page, pageSize]);

  const { data: rolosData, isFetching: isFetchingRolos } = useGetListAllEstoqueRolo(rolosQuery, {
    enabled: isTabRolos,
  });

  const rolos = rolosData?.data || [];
  
  const rolosPagination = {
    total: rolosData?.pagination?.total ?? 0,
    pages: rolosData?.pagination?.pages ?? 1,
    page: page,
    limit: pageSize,
  };

  const { data: rolosCompletosData, isFetching: isFetchingRolosCompletos } = useGetListAllEstoqueRoloCompleto(filtros, {
    enabled: isTabResumo || isTabMovimentacao,
  });
  const rolosCompletos = rolosCompletosData?.data || [];

  const { data: kpisEstoqueData, isFetching: isFetchingKPIs } = useGetKPIsEstoqueRolo(filtros);

  const { data: movimentacoesData, isFetching: isFetchingMovimentacoes } = useGetListAllMovimentacoesEstoque(filtros, {
    enabled: isTabMovimentacao,
  });

  const movimentacoes: IMovimentacaoRolo[] = (movimentacoesData || []).map((mov: any) => ({
      id: mov.id,
      estoqueRoloId: mov.estoqueRoloId ?? "",
      tipoMovimentacao: mov.tipoMovimentacao,
      pesoMovimentado: parseNumber(mov.pesoMovimentado),
      createdAt: mov.createdAt ?? new Date().toISOString(),
      rolo: mov.rolo, 
      responsavel: {
        id: mov.responsavel?.id ?? "",
        nome: mov.responsavel?.nome ?? "-",
      },
  }));

  const isLoading = isFetchingRolos || isFetchingRolosCompletos || isFetchingKPIs || isFetchingMovimentacoes;

  const handleFilterChange = useMemo(() => {
    return (nextFilters: IFiltroEstoqueRolo) => {
      setFiltros(nextFilters);
      setPage(1);
    };
  }, [setPage]);

  const handleClearFilters = useMemo(() => {
    setFiltros({});
    setPage(1);
  }, [setPage]);

  const { mutate: criar, isPending: isCreating } = useCriarEstoqueTecido();
  const { mutate: atualizar, isPending: isUpdating } = useAtualizarEstoqueTecido();
  const { mutate: deletar, isPending: isDeleting } = useDeletarEstoqueTecido();

  const form = useForm<RoloTecidoFormValues>({
    resolver: zodResolver(roloTecidoSchema),
    defaultValues: initialValues,
  });

  const {
    isOpen,
    editingItem,
    handleRemove,
    removingItemId,
    handleOpen,
    handleEdit,
    onSubmit,
    handleClose,
    isRemoveOpen,
    setIsRemoveOpen,
  } = useFormModal<RoloTecidoFormValues, EstoqueRolo>({
      initialValues,
      form,
      transformItemToForm: (item) => ({
        tecidoId: item.tecidoId,
        prefixo: item.codigoBarraRolo?.split("-")[0] || "ROL",
        dataLote: item.createdAt?.split("T")[0] || getTodayDate(),
        rolos: [{ pesoInicialKg: parseNumber(item.pesoInicialKg) }],
        codigoBarraRolo: item.codigoBarraRolo,
        pesoAtualKg: parseNumber(item.pesoAtualKg),
        situacao: normalizeSituacaoForForm(item.situacao),
      }),
      onSave: (values, id) => {
        if (id) {
          atualizar({
            id,
            pesoAtualKg: parseNumber(values.pesoAtualKg),
            situacao: normalizeSituacaoForApi(values.situacao),
            codigoBarraRolo: values.codigoBarraRolo,
          });
        } else {
          criar({
            tecidoId: values.tecidoId,
            prefixo: values.prefixo.trim().toUpperCase(),
            situacao: normalizeSituacaoForApi(values.situacao),
            dataLote: values.dataLote,
            rolos: values.rolos.map((rolo) => ({
              pesoInicialKg: parseNumber(rolo.pesoInicialKg),
            })),
          });
        }
      }
    });

  return (
    <main>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Rolos Disponíveis"
          value={`${kpisEstoqueData?.rolosDisponiveis ?? 0} Disponíveis`}
          icon={Layers}
          variant="default"
        />
        <MetricCard
          title="Peso Total"
          value={`${kpisEstoqueData?.pesoTotal ?? 0} kg`}
          icon={Weight}
          variant="success"
        />
        <MetricCard
          title="Total de Rolos"
          value={`${formatNumberToBRL(kpisEstoqueData?.valorTotalEstoque || 0)}`}
          icon={Package}
          variant="primary"
        />
      </div>

      <div className="bg-muted/50 p-4 rounded-lg border mb-6">
          <EstoqueRoloFilters onFilter={handleFilterChange} onClear={handleClearFilters} />
      </div>

      <RemoveItemWarning
        id={removingItemId || ""}
        isOpen={isRemoveOpen}
        onClose={() => setIsRemoveOpen(false)}
        title="Deseja Remover?"
        onConfirm={(id) => {
          deletar(id);
          setIsRemoveOpen(false);
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:justify-between sm:items-center">
          <TabsList className="w-full flex-col h-auto sm:w-auto sm:flex-row sm:h-10">
            <TabsTrigger value="rolos-individuais" className="w-full justify-center sm:w-auto text-xs sm:text-sm">Rolos Individuais</TabsTrigger>
            <TabsTrigger value="resumo-por-tecido" className="w-full justify-center sm:w-auto text-xs sm:text-sm">Resumo por Tecido</TabsTrigger>
            <TabsTrigger value="movimentacao-do-estoque" className="w-full justify-center sm:w-auto text-xs sm:text-sm">Movimentações do Estoque</TabsTrigger>
          </TabsList>

          <FormModal
            open={isOpen}
            onClose={handleClose}
            title={editingItem ? 'Editar Rolo' : "Novo Lote de Rolos"}
            onSubmit={onSubmit}
            loading={isCreating || isUpdating}
            isViewSaveOrCancel={true}
            trigger={
              <Button onClick={handleOpen}>
                <Plus className="mr-2 h-4 w-4" /> Novo Lote
              </Button>
            }
          >
            <Form {...form}>
              <StockFabricForm cores={cores} isEditing={!!editingItem} />
            </Form>
          </FormModal>
        </div>

        <TabsContent value="rolos-individuais">
          <div className="hidden md:block">
            <StockTable
              isLoading={isLoading}
              cores={cores}
              rolos={rolos}
              tecidos={tecidos}
              onEdit={handleEdit}
              onRemove={isAdmin ? handleRemove : undefined}
              canDelete={isAdmin}
              pagination={rolosPagination}
              currentPage={page}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
            />
          </div>
          <div className="block md:hidden">
            <MobileViewStock
              isLoading={isLoading}
              rolos={rolos}
              tecidos={tecidos}
              cores={cores}
              onEdit={handleEdit}
              onRemove={isAdmin ? handleRemove : undefined}
              canDelete={isAdmin}
            />
          </div>
        </TabsContent>

        <TabsContent value="resumo-por-tecido">
          <div className="hidden md:block">
            <ResumeStockTable
              isLoading={isLoading}
              rolos={rolosCompletos}
              cores={cores}
              tecidos={tecidos}
            />
          </div>
          <div className="block md:hidden">
            <MobileViewStockResume isLoading={isLoading} rolos={rolosCompletos} tecidos={tecidos} cores={cores} />
          </div>
        </TabsContent>

        <TabsContent value="movimentacao-do-estoque">
          <div className="hidden md:block">
            <MovementStockTable
              movimentacoes={movimentacoes}
              rolos={rolosCompletos}
              tecidos={tecidos}
              cores={cores}
              isLoading={isLoading}
            />
          </div>
          <div className="block md:hidden">
            <MobileViewStockMovement
              movimentacoes={movimentacoes}
              rolos={rolosCompletos}
              tecidos={tecidos}
              cores={cores}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}