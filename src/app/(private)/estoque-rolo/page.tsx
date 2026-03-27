'use client';
import { MetricCard } from "@/components/ui/metric-card";
import { ChevronLeft, ChevronRight, Layers, Package, Plus, Weight } from "lucide-react";
import { StockTable } from "@/components/DataTable/Tables/Estoque/table";
import { useFormModal } from "@/hooks/use-form-modal";
import { RoloTecidoFormValues, roloTecidoSchema } from "@/schemas/rolo-tecido-schema";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from "react-hook-form";
import { FormModal } from "@/components/Modal/base-modal-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { StockFabricForm } from "@/components/Forms/stock-fabric-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumeStockTable } from "@/components/DataTable/Tables/Estoque/resume-table";
import { MobileViewStock } from "@/components/MobileViewCards/StockCard/stock-card";
import { MobileViewStockResume } from "@/components/MobileViewCards/StockCard/stock-card-resume";
import { EstoqueRolo, useAtualizarEstoqueTecido, useCriarEstoqueTecido, useEstoqueTecidos, useEstoqueTecidosPaginado, useMovimentacoesEstoque, useRelatorioEstoque } from "@/hooks/queries/useEstoque";
import { useCores, useTecidos } from "@/hooks/queries/useMateriais";
import { MovementStockTable } from "@/components/DataTable/Tables/Estoque/MovimentacaoEstoque/table";
import { MobileViewStockMovement } from "@/components/MobileViewCards/StockCard/stock-card-movement";
import { parseNumber } from "@/utils/Formatter/parse-number-format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { formatNumberToBRL } from "@/utils/Formatter/moeda-brasil-format";

const getTodayDate = () => new Date().toISOString().split("T")[0];

const normalizeSituacaoForApi = (situacao: RoloTecidoFormValues["situacao"]) => {
  if (situacao === "esgotado") return "descartado" as const;
  if (!situacao) return "disponivel" as const;
  return situacao;
};

const normalizeSituacaoForForm = (situacao: string): RoloTecidoFormValues["situacao"] => {
  if (situacao === "esgotado") return "descartado";
  if (situacao === "disponivel" || situacao === "reservado" || situacao === "em_uso" || situacao === "descartado") {
    return situacao;
  }
  return "disponivel";
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

  const [paginaRolos, setPaginaRolos] = useState(1);
  const [limiteRolos, setLimiteRolos] = useState(10);

  const { data: tecidosData } = useTecidos();
  const tecidos = tecidosData || [];

  const { data: coresData } = useCores();
  const cores = coresData || [];

  const { data: rolosPaginadosData, isLoading } = useEstoqueTecidosPaginado({
    page: paginaRolos,
    limit: limiteRolos,
  });
  const rolosPaginados = rolosPaginadosData?.data || [];
  const { data: rolosCompletosData } = useEstoqueTecidos();
  const rolosCompletos = rolosCompletosData || [];
  const paginacaoRolos = rolosPaginadosData?.pagination;
  const totalPaginasRolos = paginacaoRolos?.pages || 1;
  const paginaAtualRolos = paginacaoRolos?.page || paginaRolos;
  const totalRolos = paginacaoRolos?.total || rolosPaginados.length;

  const { data: estoqueAgrupadoData } = useRelatorioEstoque();

  const { data: movimentacoesData } = useMovimentacoesEstoque();
  const movimentacoes = movimentacoesData || [];

  const { mutate: criar, isPending: isCreating } = useCriarEstoqueTecido();
  const { mutate: atualizar, isPending: isUpdating } = useAtualizarEstoqueTecido();

  const form = useForm<RoloTecidoFormValues>({
    resolver: zodResolver(roloTecidoSchema),
    defaultValues: initialValues,
  });



  const {
    isOpen,
    editingItem,
    handleOpen,
    handleEdit,
    onSubmit,
    handleClose,
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
          value={`${estoqueAgrupadoData?.rolosDisponiveis} Disponíveis`}
          icon={Layers}
          variant="default"
        />
        <MetricCard
          title="Peso Total"
          value={`${estoqueAgrupadoData?.pesoTotal} kg`}
          icon={Weight}
          variant="success"
        />
        <MetricCard
          title="Total de Rolos"
          value={`${formatNumberToBRL(estoqueAgrupadoData?.valorTotalEstoque || 0)}`}
          icon={Package}
          variant="primary"
        />
      </div>
      <Tabs defaultValue="rolos-individuais" className="w-full">
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
              <Button onClick={handleOpen} >
                <Plus className="mr-2 h-4 w-4" /> Novo Lote
              </Button>
            }
          >
            <Form {...form} >
              <StockFabricForm tecidos={tecidos} cores={cores} isEditing={!!editingItem} />
            </Form>
          </FormModal>

        </div>
        <TabsContent value="rolos-individuais">
          <div className="hidden md:block">
            <StockTable
              isLoading={isLoading}
              cores={cores}
              rolos={rolosPaginados}
              tecidos={tecidos}
              onEdit={handleEdit}
            />
          </div>
          <div className="block md:hidden">
            <MobileViewStock
              isLoading={isLoading}
              rolos={rolosPaginados}
              tecidos={tecidos}
              cores={cores}
              onEdit={handleEdit}
            />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {rolosPaginados.length} de {totalRolos} rolos
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Linhas por pagina</span>
              <Select
                value={String(limiteRolos)}
                onValueChange={(value) => {
                  setLimiteRolos(Number(value));
                  setPaginaRolos(1);
                }}
              >
                <SelectTrigger className="h-8 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 30, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={String(pageSize)}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaRolos((current) => Math.max(1, current - 1))}
                disabled={isLoading || paginaAtualRolos <= 1}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Anterior
              </Button>

              <span className="text-sm text-muted-foreground px-1">
                Pagina {paginaAtualRolos} de {totalPaginasRolos}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaRolos((current) => Math.min(totalPaginasRolos, current + 1))}
                disabled={isLoading || paginaAtualRolos >= totalPaginasRolos}
              >
                Proxima
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
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
  )
}