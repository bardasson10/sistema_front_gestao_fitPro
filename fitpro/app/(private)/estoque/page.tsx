'use client';
import { MetricCard } from "@/components/ui/metric-card";
import { Layers, Package, Plus, Weight } from "lucide-react";
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
import { useAtualizarEstoqueTecido, useCriarEstoqueTecido, useCriarMovimentacaoEstoque, useDeletarEstoqueTecido, useEstoqueTecidos, useMovimentacaoEstoque, useMovimentacoesEstoque, useRelatorioEstoque } from "@/hooks/queries/useEstoque";
import { useCores, useTecidos } from "@/hooks/queries/useMateriais";
import { MovementStockTable } from "@/components/DataTable/Tables/Estoque/MovimentacaoEstoque/table";
import { MobileViewStockMovement } from "@/components/MobileViewCards/StockCard/stock-card-movement";
import { useAuth } from "@/hooks/use-auth";
import { useColaboradores } from "@/hooks/queries/useColaboradores";
import { parseNumber } from "@/utils/Formatter/parse-number-format";
import { use, useEffect } from "react";

const initialValues: RoloTecidoFormValues = {
  tecidoId: "",
  codigoBarraRolo: "",
  pesoAtualKg: 0,
  situacao: "",
};

export default function Estoque() {

  const { data: tecidosData } = useTecidos();
  const tecidos = tecidosData || [];

  const { data: coresData } = useCores();
  const cores = coresData || [];

  const { data: rolosData, isLoading } = useEstoqueTecidos();
  const rolos = rolosData || [];

  const { data: estoqueAgrupadoData } = useRelatorioEstoque();

  const { data: movimentacoesData } = useMovimentacoesEstoque();
  const movimentacoes = movimentacoesData || [];

  const { user } = useAuth();

  const { data: colaboradoresData } = useColaboradores({
    userPerfil: user.perfil as 'ADM' | 'GERENTE' | 'FUNCIONARIO',
    excludeUserId: user.id,
  });

  const usuarios = colaboradoresData?.data || [];


  const { mutate: criar, isPending: isCreating } = useCriarEstoqueTecido();
  const { mutate: atualizar, isPending: isUpdating } = useAtualizarEstoqueTecido();
  const { mutate: deletar } = useDeletarEstoqueTecido();

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
    isSubmitting,
    handleClose } = useFormModal({
      initialValues,
      form,
      onSave: (values, id) => {
        if (id) {
          atualizar({
            id,
            pesoAtualKg: parseNumber(values.pesoAtualKg),
            situacao: values.situacao as 'disponivel' | 'reservado' | 'em_uso' | 'descartado',
          });
        } else {
          criar({
            tecidoId: values.tecidoId,
            codigoBarraRolo: values.codigoBarraRolo,
            pesoInicialKg: parseNumber(values.pesoAtualKg),
            pesoAtualKg: parseNumber(values.pesoAtualKg),
            situacao: values.situacao as 'disponivel' | 'reservado' | 'em_uso' | 'descartado',
          });
        }
      }
    });

      useEffect(() => {
        if (editingItem) {
          form.reset({
            ...editingItem,
            tecidoId: form.getValues("tecidoId"),
            codigoBarraRolo: form.getValues("codigoBarraRolo"),
            pesoAtualKg: parseNumber(form.getValues("pesoAtualKg")),
            situacao: form.getValues("situacao") as 'disponivel' | 'reservado' | 'em_uso' | 'descartado',
          } as RoloTecidoFormValues);
        }
      }, [editingItem]);

  return (
    <main>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Rolos Disponíveis"
          value={`${estoqueAgrupadoData?.totalRolos} rolos`}
          icon={Package}
          variant="primary"
        />
        <MetricCard
          title="Peso Total"
          value={`${estoqueAgrupadoData?.pesoTotal} kg`}
          icon={Weight}
          variant="success"
        />
        <MetricCard
          title="TRolos Disponíveis"
          value={`${estoqueAgrupadoData?.rolosDisponíveis} Disponíveis`}
          icon={Layers}
          variant="default"
        />
      </div>
      <Tabs defaultValue="rolos-individuais" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="rolos-individuais">Rolos Individuais</TabsTrigger>
            <TabsTrigger value="resumo-por-tecido">Resumo por Tecido</TabsTrigger>
            <TabsTrigger value="movimentacao-do-estoque">Movimentações do Estoque</TabsTrigger>
          </TabsList>
          <FormModal
            open={isOpen}
            onClose={handleClose}
            title={editingItem ? 'Editar Tecido' : "Novo Tecido"}
            onSubmit={onSubmit}
            loading={isSubmitting}
            isViewSaveOrCancel={true}
            trigger={
              <Button onClick={handleOpen} >
                <Plus className="mr-2 h-4 w-4" /> Novo Tecido
              </Button>
            }
          >
            <Form {...form} >
              <StockFabricForm tecidos={tecidos} cores={cores} />
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
            />
          </div>
          <div className="block md:hidden">
            <MobileViewStock
              isLoading={isLoading}
              rolos={rolos}
              tecidos={tecidos}
              cores={cores}
              onEdit={handleEdit}
            />
          </div>
        </TabsContent>
        <TabsContent value="resumo-por-tecido">
          <div className="hidden md:block">
            <ResumeStockTable
              isLoading={isLoading}
              rolos={rolos}
              cores={cores}
              tecidos={tecidos}
            />
          </div>
          <div className="block md:hidden">
            <MobileViewStockResume isLoading={isLoading} rolos={rolos} tecidos={tecidos} cores={cores} />
          </div>
        </TabsContent>
        <TabsContent value="movimentacao-do-estoque">
          <div className="hidden md:block">
            <MovementStockTable
              movimentacoes={movimentacoes}
              rolos={rolos}
              tecidos={tecidos}
              cores={cores}
              isLoading={isLoading}
            />
          </div>
          <div className="block md:hidden">
            <MobileViewStockMovement
              movimentacoes={movimentacoes}
              rolos={rolos}
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