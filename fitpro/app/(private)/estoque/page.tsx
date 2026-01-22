'use client';
import React from "react";
import { getGroupedStockColumns } from "@/components/DataTable/Tables/Estoque/resume-colums";
import { MetricCard } from "@/components/ui/metric-card";
import { useProduction } from "@/providers/PrivateContexts/ProductionProvider";
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

const initialValues: RoloTecidoFormValues = {
  tecidoId: '',
  identificacao: '',
  pesoKg: 0,
  status: "disponivel"
};

export default function Estoque() {
  const { tecidos, rolos, isLoading, addRolo, updateRolo } = useProduction();

  const { id, cor, tipo } = tecidos.map(t => t)[0] || { id: '', cor: '', tipo: '' };
  const estoqueAgrupado = React.useMemo(
    () => getGroupedStockColumns(rolos, [{ id, cor, tipo }]),
    [rolos, tecidos]
  );

  const pesoTotal = rolos.reduce((acc, curr) => acc + (Number(curr.pesoKg) || 0), 0);

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
          updateRolo(id, values);
        } else {
          addRolo(values);
        }
        handleClose();
      }
    });
  return (
    <main>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Rolos Disponíveis"
          value={rolos.length}
          icon={Package}
          variant="primary"
        />
        <MetricCard
          title="Peso Total"
          value={`${pesoTotal} kg`}
          icon={Weight}
          variant="success"
        />
        <MetricCard
          title="Tipos de Tecido"
          value={`${estoqueAgrupado.map((f) => f.rolos)}`}
          icon={Layers}
          variant="default"
        />
      </div>
      <Tabs defaultValue="rolos-individuais" className="w-full">
        <div className="flex justify-between items-center mb-6">
        <TabsList>
          <TabsTrigger value="rolos-individuais">Rolos Individuais</TabsTrigger>
          <TabsTrigger value="resumo-por-tecido">Resumo por Tecido</TabsTrigger>

        </TabsList>
          <FormModal
            open={isOpen}
            onClose={handleClose}
            title={editingItem ? 'Editar Tecido' : "Novo Tecido"}
            onSubmit={onSubmit}
            loading={isSubmitting}
            trigger={
              <Button onClick={handleOpen} >
                <Plus className="mr-2 h-4 w-4" /> Novo Tecido
              </Button>
            }
          >

            <Form {...form} >
              <StockFabricForm tecidos={tecidos} />
            </Form>

          </FormModal>
        </div>
        <TabsContent value="rolos-individuais">
          <div className="hidden md:block">
            <StockTable
              isLoading={isLoading}
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
            onEdit={handleEdit}
            />
          </div>
        </TabsContent>
        <TabsContent value="resumo-por-tecido">
          <div className="hidden md:block">
            <ResumeStockTable
              isLoading={isLoading}
              rolos={rolos}
              tecidos={tecidos}
            />
          </div>
          <div className="block md:hidden">
            <MobileViewStockResume isLoading={isLoading} rolos={rolos} tecidos={tecidos} />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}