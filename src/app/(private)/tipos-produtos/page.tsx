"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormModal } from "@/components/Modal/base-modal-form";
import { TiposProdutoTable } from "@/components/DataTable/Tables/TiposProduto/table";
import { AssociarTamanhoForm } from "@/components/Forms/TiposProduto/associar-tamanho-form";
import { TipoProdutoForm } from "@/components/Forms/TiposProduto/tipo-produto-form";
import { MobileViewTiposProduto } from "@/components/MobileViewCards/TiposProdutoCard";
import { RemoveItemWarning } from "@/components/ErrorManagementComponent/WarnningRemoveItem";
import {
  useAssociarTamanhoTipo,
  useCriarTipoProduto,
  useAtualizarTipoProduto,
  useDeletarAssociacaoTamanhoTipo,
  useDeletarTipoProduto,
  useTamanhos,
  Tamanho,
  useTiposProduto,
  TiposProdutosSchema,
} from "@/hooks/queries/useProdutos";
import {
  associarTamanhoSchema,
  AssociarTamanhoFormValues,
  criarTipoProdutoSchema,
  CriarTipoProdutoFormValues,
} from "@/schemas/produto/tipos-produtos";
import { useFormModal } from "@/hooks/use-form-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const initialValues: CriarTipoProdutoFormValues = {
  nome: "",
};

export default function TiposProdutosPage() {
  const { data: tiposProdutoData, isLoading } = useTiposProduto();
  const tiposProdutos = tiposProdutoData?.data || [];

  const { data: tamanhosData } = useTamanhos();
  const tamanhos = Array.isArray(tamanhosData) ? tamanhosData : [];

  const { mutate: associarTamanho, isPending: isAssociando } = useAssociarTamanhoTipo();
  const { mutate: desassociarTamanho, isPending: isDesassociando } = useDeletarAssociacaoTamanhoTipo();
  const { mutate: criarTipo, isPending: isCriandoTipo } = useCriarTipoProduto();
  const { mutate: atualizarTipo, isPending: isAtualizandoTipo } = useAtualizarTipoProduto();
  const { mutate: deletarTipo } = useDeletarTipoProduto();

  const [isAssociarOpen, setIsAssociarOpen] = useState(false);
  const [isDesassociarOpen, setIsDesassociarOpen] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState<TiposProdutosSchema | null>(null);
  const [tamanhosDisponiveis, setTamanhosDisponiveis] = useState<Tamanho[]>([]);
  const [tamanhosAssociados, setTamanhosAssociados] = useState<Tamanho[]>([]);

  const associarForm = useForm<AssociarTamanhoFormValues>({
    resolver: zodResolver(associarTamanhoSchema),
    defaultValues: { tamanhos: [] },
  });

  const desassociarForm = useForm<AssociarTamanhoFormValues>({
    defaultValues: { tamanhos: [] },
  });

  const criarTipoForm = useForm<CriarTipoProdutoFormValues>({
    resolver: zodResolver(criarTipoProdutoSchema),
    defaultValues: initialValues,
  });

  const {
    isOpen: isCriarOpen,
    handleOpen: handleOpenCriar,
    handleEdit: handleEditCriar,
    handleClose: handleCloseCriar,
    handleRemove: handleRemoveTipo,
    removingItemId,
    isRemoveOpen,
    setIsRemoveOpen,
    editingItem,
    onSubmit: onSubmitCriar,
    isSubmitting: isCriarSubmitting,
  } = useFormModal({
    form: criarTipoForm,
    initialValues,
    transformItemToForm: (item: TiposProdutosSchema) => ({
      nome: item.nome,
    }),
    onSave: (values, id) => {
      if (id) {
        atualizarTipo({ id, nome: values.nome });
      } else {
        criarTipo(values.nome);
      }
    },
  });

  useEffect(() => {
    if (!isAssociarOpen) {
      associarForm.reset({ tamanhos: [] });
      setTamanhosDisponiveis([]);
    }
  }, [isAssociarOpen, associarForm]);

  useEffect(() => {
    if (!isDesassociarOpen) {
      desassociarForm.reset({ tamanhos: [] });
      setTamanhosAssociados([]);
    }
  }, [isDesassociarOpen, desassociarForm]);

  const handleOpenAssociar = (tipo: TiposProdutosSchema) => {
    const associados = new Set((tipo.tamanhos || []).map((tamanho) => tamanho.tamanhoId));
    const disponiveis = tamanhos.filter((tamanho) => !associados.has(tamanho.id));

    if (disponiveis.length === 0) {
      toast.info("Todos os tamanhos ja estao associados a este tipo.");
      return;
    }

    setTipoSelecionado(tipo);
    setTamanhosDisponiveis(disponiveis);
    setIsAssociarOpen(true);
  };

  const handleCloseAssociar = () => {
    setIsAssociarOpen(false);
    setTipoSelecionado(null);
  };

  const handleOpenDesassociar = (tipo: TiposProdutosSchema) => {
    const associados = (tipo.tamanhos || []).map((tamanho) => ({
      id: tamanho.tamanhoId,
      nome: tamanho.NomeTamanho,
      ordem: tamanho.OrdemTamanho,
      createdAt: "",
    }));

    if (associados.length === 0) {
      toast.info("Nao ha tamanhos associados a este tipo.");
      return;
    }

    setTipoSelecionado(tipo);
    setTamanhosAssociados(associados);
    desassociarForm.reset({ tamanhos: associados.map((tamanho) => tamanho.id) });
    setIsDesassociarOpen(true);
  };

  const handleCloseDesassociar = () => {
    setIsDesassociarOpen(false);
    setTipoSelecionado(null);
  };

  const handleSubmitAssociar = associarForm.handleSubmit((values) => {
    if (!tipoSelecionado) return;

    associarTamanho({
      tipoProdutoId: tipoSelecionado.id,
      tamanhos: values.tamanhos.map((tamanhoId) => ({ tamanhoId })),
    });

    handleCloseAssociar();
  });

  const handleSubmitDesassociar = desassociarForm.handleSubmit((values) => {
    if (!tipoSelecionado) return;

    const tamanhosMarcados = new Set(values.tamanhos);
    const tamanhosParaDesassociar = tamanhosAssociados
      .filter((tamanho) => !tamanhosMarcados.has(tamanho.id))
      .map((tamanho) => ({ tamanhoId: tamanho.id }));

    if (tamanhosParaDesassociar.length === 0) {
      toast.info("Desmarque ao menos um tamanho para desassociar.");
      return;
    }

    desassociarTamanho({
      idProduto: tipoSelecionado.id,
      tamanhos: tamanhosParaDesassociar,
    });

    handleCloseDesassociar();
  });

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {tiposProdutos.length} tipos de produto cadastrados
        </div>
        <FormModal
          open={isCriarOpen}
          onClose={handleCloseCriar}
          title={editingItem ? "Editar tipo de produto" : "Novo tipo de produto"}
          onSubmit={onSubmitCriar}
          loading={isCriarSubmitting || isCriandoTipo || isAtualizandoTipo}
          isViewSaveOrCancel={true}
          trigger={
            <Button onClick={handleOpenCriar}>
              <Plus className="mr-2 h-4 w-4" /> Novo tipo de produto
            </Button>
          }
        >
          <Form {...criarTipoForm}>
            <TipoProdutoForm />
          </Form>
        </FormModal>
      </div>

      <FormModal
        open={isAssociarOpen}
        onClose={handleCloseAssociar}
        title={tipoSelecionado ? `Associar tamanhos - ${tipoSelecionado.nome}` : "Associar tamanhos"}
        onSubmit={handleSubmitAssociar}
        loading={isAssociando}
        isViewSaveOrCancel={true}
      >
        <Form {...associarForm}>
          <AssociarTamanhoForm tamanhos={tamanhosDisponiveis} />
        </Form>
      </FormModal>

      <FormModal
        open={isDesassociarOpen}
        onClose={handleCloseDesassociar}
        title={tipoSelecionado ? `Desassociar tamanhos - ${tipoSelecionado.nome}` : "Desassociar tamanhos"}
        onSubmit={handleSubmitDesassociar}
        loading={isDesassociando}
        isViewSaveOrCancel={true}
      >
        <Form {...desassociarForm}>
          <AssociarTamanhoForm tamanhos={tamanhosAssociados} />
        </Form>
      </FormModal>

      <RemoveItemWarning
        id={removingItemId || ""}
        isOpen={isRemoveOpen}
        onClose={() => setIsRemoveOpen(false)}
        title="Deseja remover?"
        onConfirm={(id) => {
          deletarTipo(id);
          setIsRemoveOpen(false);
        }}
      />

      <div className="hidden md:block">
        <TiposProdutoTable
          tiposProdutos={tiposProdutos}
          isLoading={isLoading || isCriandoTipo || isAtualizandoTipo || isDesassociando}
          onAssociate={handleOpenAssociar}
          onDissociate={handleOpenDesassociar}
          onEdit={handleEditCriar}
          onRemove={handleRemoveTipo}
        />
      </div>

      <div className="block md:hidden">
        <MobileViewTiposProduto
          tiposProdutos={tiposProdutos}
          isLoading={isLoading || isCriandoTipo || isAtualizandoTipo || isDesassociando}
          onAssociate={handleOpenAssociar}
          onDissociate={handleOpenDesassociar}
          onEdit={handleEditCriar}
          onRemove={handleRemoveTipo}
        />
      </div>
    </main>
  );
}