'use client';

import { FabricTable } from '@/components/DataTable/Tables/Tecido/table';
import { RemoveItemWarning } from '@/components/ErrorManagementComponent/WarnningRemoveItem';
import { FabricForm } from '@/components/Forms/fabric-form';
import { TecidoFilters, TecidoFiltersValues } from '@/components/Forms/tecido-filters';
import { MobileViewFabric } from '@/components/MobileViewCards/FabricCard';
import { FormModal } from '@/components/Modal/base-modal-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useFormModal } from '@/hooks/use-form-modal';
import {
  useTecidos,
  useCriarTecido,
  useAtualizarTecido,
  useDeletarTecido,
  useFornecedores,
  useCores,
} from '@/hooks/queries/useMateriais';
import { FabricFormValues, fabricSchema } from '@/schemas/tecido-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { parseNumber } from '@/utils/Formatter/parse-number-format';

const initialValues: FabricFormValues = {
  fornecedorId: '',
  corId: '',
  nome: '',
  codigoReferencia: '',
  rendimentoMetroKg: 0,
  larguraMetros: 0,
  valorPorKg: 0,
  gramatura: 0,
};

const ITEMS_PER_PAGE = 10;

export default function Tecidos() {
  // Estados de filtro e paginação
  const [filtros, setFiltros] = useState<TecidoFiltersValues>({
    fornecedorId: undefined,
    corId: undefined,
    nome: undefined,
    codigoReferencia: undefined,
    gramatura: undefined,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);

  // Queries
  const { data: tecidosResponse, isLoading } = useTecidos({
    ...filtros,
    page,
    limit: pageSize,
  });

  const tecidos = tecidosResponse?.data || [];
  const pagination = tecidosResponse?.pagination || { total: 0, page: 1, limit: pageSize, pages: 1 };

  const { data: fornecedoresData } = useFornecedores();
  const fornecedores = fornecedoresData || [];

  const { data: coresData } = useCores();
  const cores = coresData || [];

  // Mutations
  const { mutate: criar, isPending: isCreating } = useCriarTecido();
  const { mutate: atualizar, isPending: isUpdating } = useAtualizarTecido();
  const { mutate: deletar } = useDeletarTecido();

  const form = useForm<FabricFormValues>({
    resolver: zodResolver(fabricSchema),
    defaultValues: initialValues,
  });


  const {
    isOpen,
    editingItem,
    handleRemove,
    removingItemId,
    handleOpen,
    handleEdit,
    handleClose,
    onSubmit,
    isSubmitting,
    isRemoveOpen,
    setIsRemoveOpen,
  } = useFormModal({
    form,
    initialValues,
    onSave: (values, id) => {
      if (id) {
        atualizar({
          id,
          fornecedorId: values.fornecedorId,
          corId: values.corId,
          nome: values.nome,
          codigoReferencia: values.codigoReferencia || '',
          rendimentoMetroKg: parseNumber(values.rendimentoMetroKg) || 0,
          larguraMetros: parseNumber(values.larguraMetros) || 0,
          valorPorKg: parseNumber(values.valorPorKg) || 0,
          gramatura: parseNumber(values.gramatura) || 0,
        });
      } else {
        criar({
          fornecedorId: values.fornecedorId,
          corId: values.corId,
          nome: values.nome,
          codigoReferencia: values.codigoReferencia || '',
          rendimentoMetroKg: parseNumber(values.rendimentoMetroKg) || 0,
          larguraMetros: parseNumber(values.larguraMetros) || 0,
          valorPorKg: parseNumber(values.valorPorKg) || 0,
          gramatura: parseNumber(values.gramatura) || 0,
        });
      }
      handleClose();
    },
  });

  // Resetar formulário quando o modal fecha
  useEffect(() => {
    if (!isOpen) {
      form.reset(initialValues);
    }
  }, [isOpen, form]);

  // Atualizar formulário quando selecionando item para editar
  useEffect(() => {
    if (editingItem) {
      form.reset({
        editingItem,
        fornecedorId: form.getValues("fornecedorId"),
        corId: form.getValues("corId"),
        nome: form.getValues("nome"),
        codigoReferencia: form.getValues("codigoReferencia") || '',
        rendimentoMetroKg: parseNumber(form.getValues("rendimentoMetroKg")) || 0,
        larguraMetros: parseNumber(form.getValues("larguraMetros")) || 0,
        valorPorKg: parseNumber(form.getValues("valorPorKg")) || 0,
        gramatura: parseNumber(form.getValues("gramatura")) || 0,
      } as FabricFormValues);
    }
  }, [editingItem]);

  const handleFilterChange = (newFiltros: TecidoFiltersValues) => {
    setFiltros(newFiltros);
    setPage(1); // Resetar para primeira página
  };

  const handleClearFilters = () => {
    setFiltros({
      fornecedorId: undefined,
      corId: undefined,
      nome: undefined,
      codigoReferencia: undefined,
      gramatura: 0,
    });
    setPage(1);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Resetar para primeira página
  };

  return (
    <main className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {pagination.total} tecidos encontrados
        </div>

        <Button onClick={handleOpen}>
          <Plus className="mr-2 h-4 w-4" /> Novo Tecido
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-muted/50 p-4 rounded-lg border">
        <TecidoFilters
          fornecedores={fornecedores}
          cores={cores}
          onFilter={handleFilterChange}
          onClear={handleClearFilters}
        />
      </div>

      <FormModal
        open={isOpen}
        onClose={handleClose}
        title={editingItem ? 'Editar Tecido' : 'Novo Tecido'}
        onSubmit={onSubmit}
        loading={isSubmitting || isCreating || isUpdating}
        isViewSaveOrCancel={true}
      >
        <Form {...form}>
          <FabricForm fornecedores={fornecedores} cores={cores} />
        </Form>
      </FormModal>

      <RemoveItemWarning
        id={removingItemId || ''}
        isOpen={isRemoveOpen}
        onClose={() => setIsRemoveOpen(false)}
        title='Deseja Remover?'
        onConfirm={(id) => {
          deletar(id);
          setIsRemoveOpen(false);
        }}
      />

      <div className="hidden md:block">
        <FabricTable
          tecidos={tecidos}
          isLoading={isLoading || isCreating || isUpdating}
          fornecedores={fornecedores}
          cores={cores}
          onEdit={handleEdit}
          onRemove={handleRemove}
          pagination={pagination}
          currentPage={page}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      <div className="block md:hidden">
        <MobileViewFabric
          tecidos={tecidos}
          isLoading={isLoading || isCreating || isUpdating}
          fornecedores={fornecedores}
          cores={cores}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </div>
    </main>
  );
}

