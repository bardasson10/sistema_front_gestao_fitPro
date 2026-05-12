

"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormModal } from "@/components/Modal/base-modal-form";
import { RemoveItemWarning } from "@/components/ErrorManagementComponent/WarnningRemoveItem";
import { ProdutoTable } from "@/components/DataTable/Tables/Produto/table";
import { MobileViewProduto } from "@/components/MobileViewCards/ProdutoCard";
import { ProdutoForm } from "@/components/Forms/produto-form";
import { useFormModal } from "@/hooks/use-form-modal";
import {
  Produto,
  useAtualizarProduto,
  useCriarProduto,
  useDeletarProduto,
  useProdutos,
  useTiposProduto,
} from "@/hooks/queries/useProdutos";
import { ProdutoFormValues, produtoSchema } from "@/schemas/produto/produto-schema";

const initialValues: ProdutoFormValues = {
  tipoProdutoId: "",
  nome: "",
  sku: "",
  fabricante: "",
  custoMedioPeca: 0,
  precoMedioVenda: 0,
};

export default function ProdutosPage() {
  const { data: produtosData, isLoading } = useProdutos();
  const produtos = produtosData?.data || [];
  const [activeTab, setActiveTab] = useState("produto");

  const { data: tiposProdutoData } = useTiposProduto();
  const tiposProduto = tiposProdutoData?.data || [];
  const forroTipoProdutoId = useMemo(() => {
    return tiposProduto.find((item) => item.nome.toLowerCase() === "forro")?.id;
  }, [tiposProduto]);

  const produtosForro = useMemo(() => {
    return produtos.filter(
      (produto) => produto.tipoProdutoId === forroTipoProdutoId || produto.tipo?.nome === "Forro"
    );
  }, [forroTipoProdutoId, produtos]);

  const { mutate: criar, isPending: isCreating } = useCriarProduto();
  const { mutate: atualizar, isPending: isUpdating } = useAtualizarProduto();
  const { mutate: deletar } = useDeletarProduto();

  const form = useForm<ProdutoFormValues>({
    resolver: zodResolver(produtoSchema),
    defaultValues: initialValues,
  });

  const {
    isOpen,
    editingItem,
    handleOpen,
    handleEdit,
    handleClose,
    handleRemove,
    removingItemId,
    onSubmit,
    isSubmitting,
    isRemoveOpen,
    setIsRemoveOpen,
  } = useFormModal<ProdutoFormValues, Produto>({
    form,
    initialValues,
    transformItemToForm: (item) => ({
      tipoProdutoId: item.tipoProdutoId,
      nome: item.nome,
      sku: item.sku,
      fabricante: item.fabricante,
      custoMedioPeca: Number(item.custoMedioPeca) || 0,
      precoMedioVenda: Number(item.precoMedioVenda) || 0,
    }),
    onSave: (values, id) => {
      if (id) {
        atualizar({ id, ...values });
      } else {
        criar(values);
      }
    },
  });

  const produtosExibidos = activeTab === "forro" ? produtosForro : produtos;

  return (
    <main className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {produtosExibidos.length} produtos cadastrados
        </div>

        <Button onClick={handleOpen}>
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      <FormModal
        open={isOpen}
        onClose={handleClose}
        title={editingItem ? "Editar Produto" : "Novo Produto"}
        onSubmit={onSubmit}
        loading={isSubmitting || isCreating || isUpdating}
        isViewSaveOrCancel={true}
      >
        <Form {...form}>
          <ProdutoForm tiposProduto={tiposProduto} />
        </Form>
      </FormModal>

      <RemoveItemWarning
        id={removingItemId || ""}
        isOpen={isRemoveOpen}
        onClose={() => setIsRemoveOpen(false)}
        title="Deseja remover?"
        onConfirm={(id) => {
          deletar(id);
          setIsRemoveOpen(false);
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="produto">Produto</TabsTrigger>
          <TabsTrigger value="forro">Forro</TabsTrigger>
        </TabsList>

        <TabsContent value="produto" className="space-y-4">
          <div className="hidden md:block">
            <ProdutoTable
              produtos={produtos}
              tiposProduto={tiposProduto}
              isLoading={isLoading || isCreating || isUpdating}
              onEdit={handleEdit}
              onRemove={handleRemove}
            />
          </div>

          <div className="block md:hidden">
            <MobileViewProduto
              produtos={produtos}
              tiposProduto={tiposProduto}
              isLoading={isLoading || isCreating || isUpdating}
              onEdit={handleEdit}
              onRemove={handleRemove}
            />
          </div>
        </TabsContent>

        <TabsContent value="forro" className="space-y-4">
          <div className="hidden md:block">
            <ProdutoTable
              produtos={produtosForro}
              tiposProduto={tiposProduto}
              isLoading={isLoading || isCreating || isUpdating}
              onEdit={handleEdit}
              onRemove={handleRemove}
            />
          </div>

          <div className="block md:hidden">
            <MobileViewProduto
              produtos={produtosForro}
              tiposProduto={tiposProduto}
              isLoading={isLoading || isCreating || isUpdating}
              onEdit={handleEdit}
              onRemove={handleRemove}
            />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}