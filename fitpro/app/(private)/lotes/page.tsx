'use client';
import { LoteProducaoTable } from "@/components/DataTable/Tables/LoteProducao/table";
import { LoteProducaoForm } from "@/components/Forms/LoteProducao/loteProducao-form";

import { FormModal } from "@/components/Modal/base-modal-form";
import STEPS from "@/components/StepIndicator/LoteProducaoForm/steps";
import StepIndicator from "@/components/StepIndicator/step-indicador";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useFormModal } from "@/hooks/use-form-modal";
import { useLotesProducao, useCriarLoteProducao, useAtualizarLoteProducao } from "@/hooks/queries/useProducao";
import { useProdutos, useTamanhos } from "@/hooks/queries/useProdutos";
import { LoteProducaoFormValues, loteProducaoSchema } from "@/schemas/LoteProducao/lote-producao-schemas";
import { ColaboradorLote, LoteProducao } from "@/types/production";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Plus, Save, ScissorsIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { parseNumber } from "@/utils/Formatter/parse-number-format";
import { string } from "zod";
import { toast } from "sonner";


const initialValues: LoteProducaoFormValues = {
  codigo: '',
  status: 'planejado',
  createdAt: '',
  responsavelId: '',
  responsavel: {} as ColaboradorLote,
  grade: [],
  tecido: [],
  direcionamentos: [],
};

export default function Lotes() {
  const { data: lotesData = { data: [], pagination: {} }, isLoading } = useLotesProducao();
  const { mutate: criar, isPending: isCreating } = useCriarLoteProducao();
  const { mutate: atualizar, isPending: isUpdating } = useAtualizarLoteProducao();
  const { data: produtos = [] } = useProdutos();
  const { data: tamanhos = [] } = useTamanhos();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = STEPS.length;
  const CurrentStepComponent = STEPS.find(step => step.id === currentStep)?.component;

  const form = useForm<LoteProducaoFormValues>({
    resolver: zodResolver(loteProducaoSchema),
    defaultValues: initialValues,
  });

  const handleSaveLote = (values: LoteProducaoFormValues, id?: string) => {
    console.log('handleSaveLote chamado com valores:', values);

    // Validar dados obrigatórios
    if (!values.codigo?.trim()) {
      toast.error('Código do lote é obrigatório');
      return;
    }

    if (!values.responsavelId) {
      toast.error('Responsável é obrigatório');
      return;
    }

    if (!values.status) {
      toast.error('Status é obrigatório');
      return;
    }

    if (!values.tecido || values.tecido.length === 0) {
      toast.error('Tecido é obrigatório');
      return;
    }

    if (!values.grade || values.grade.length === 0) {
      toast.error('Grade de produtos é obrigatória');
      return;
    }

    // Converter grade de volta para items array
    const items = values.grade?.flatMap(grade => {
      const produtoId = grade.produtoId;

      if (!produtoId) return [];

      // Mapear cada tamanho para um item
      const tamanhoFields = [
        { field: 'gradePP', tamanhoProcurado: 'PP' },
        { field: 'gradeP', tamanhoProcurado: 'P' },
        { field: 'gradeM', tamanhoProcurado: 'M' },
        { field: 'gradeG', tamanhoProcurado: 'G' },
        { field: 'gradeGG', tamanhoProcurado: 'GG' },
      ];

      return tamanhoFields.flatMap(({ field, tamanhoProcurado }) => {
        const quantidade = (grade as any)[field] || 0;
        const tamanho = tamanhos.find((t: { nome: string }) => t.nome === tamanhoProcurado);

        if (quantidade > 0 && tamanho) {
          return [{
            produtoId: produtoId,
            tamanhoId: tamanho.id,
            quantidadePlanejada: quantidade,
          }];
        }
        return [];
      });
    }) || [];

    if (items.length === 0) {
      toast.error('Nenhuma grade foi preenchida');
      return;
    }

    const payload = {
      codigoLote: values.codigo,
      tecidoId: values.tecido[0].roloId,
      responsavelId: values.responsavelId,
      status: values.status as 'planejado' | 'em_producao' | 'concluido' | 'cancelado',
      observacao: '',
      items,
      rolos: values.tecido[0].rolos?.itens && values.tecido[0].rolos.itens.length > 0
        ? values.tecido[0].rolos.itens.map(rolo => ({
          estoqueRoloId: rolo.id,
          pesoReservado: parseNumber(String(rolo.pesoInicialKg || rolo.pesoAtualKg || 0)),
        }))
        : [],
    };

    console.log('Payload pronto para envio:', payload);

    if (id) {
      console.log('Atualizando lote com ID:', id);
      atualizar({ id, ...payload });
    } else {
      console.log('Criando novo lote');
      criar(payload as any);
    }
  };

  const {
    isOpen,
    editingItem,
    handleOpen,
    handleEdit,
    handleClose,
    onSubmit,
    isSubmitting,
  } = useFormModal({
    form,
    initialValues,
    onSave: (values, id) => handleSaveLote(values, id),
  });

  const handleEditLote = (lote: LoteProducao) => {
    // Agrupar items por produto e tamanho para criar a grade
    const gradeMap = new Map<string, {
      produtoId: string;
      produtoNome: string;
      grades: { [key: string]: number }
    }>();

    lote.items?.forEach(item => {
      const produtoId = item.produtoId || '';
      const produtoNome = item.produto?.nome || '';
      const tamanhoNome = item.tamanho?.nome || '';
      const quantidade = item.quantidadePlanejada || 0;

      if (!gradeMap.has(produtoId)) {
        gradeMap.set(produtoId, {
          produtoId,
          produtoNome,
          grades: {
            gradePP: 0,
            gradeP: 0,
            gradeM: 0,
            gradeG: 0,
            gradeGG: 0,
          }
        });
      }

      // Mapear tamanho para o campo de grade
      const gradeObj = gradeMap.get(produtoId)!.grades;
      const gradeKey = `grade${tamanhoNome}`;

      if (gradeKey in gradeObj) {
        (gradeObj as any)[gradeKey] += quantidade;
      }
    });

    // Converter mapa para array de GradeProduto
    const gradeArray = Array.from(gradeMap.values()).map((item) => {
      const total = (item.grades.gradePP || 0) + (item.grades.gradeP || 0) + (item.grades.gradeM || 0) + (item.grades.gradeG || 0) + (item.grades.gradeGG || 0);
      return {
        id: crypto.randomUUID(),
        produtoId: item.produtoId,
        produto: item.produtoNome,
        gradePP: item.grades.gradePP || 0,
        gradeP: item.grades.gradeP || 0,
        gradeM: item.grades.gradeM || 0,
        gradeG: item.grades.gradeG || 0,
        gradeGG: item.grades.gradeGG || 0,
        total,
      };
    });

    // Mapear dados da API para o formulário
    const formValues: LoteProducaoFormValues = {
      codigo: lote.codigoLote,
      status: lote.status || '',
      createdAt: lote.createdAt,
      responsavelId: lote.responsavelId,
      responsavel: lote.responsavel ? {
        id: lote.responsavel.id,
        nome: lote.responsavel.nome,
        perfil: lote.responsavel.perfil,
        funcaoSetor: (lote.responsavel as any).funcaoSetor || '',
        status: lote.responsavel.status || '',
      } : {
        id: '',
        nome: '',
        perfil: '',
        funcaoSetor: '',
        status: '',

      },
      grade: gradeArray,
      tecido: lote.tecido ? (Array.isArray(lote.tecido) ? lote.tecido : [lote.tecido]).map(tecido => ({
        id: tecido.id,
        roloId: lote.tecidoId,
        codigoReferencia: tecido.codigoReferencia || '',
        rendimentoMetroKg: parseNumber(tecido.rendimentoMetroKg) || 0,
        valorPorKg: parseNumber(tecido.valorPorKg) || 0,
        gramatura: parseNumber(tecido.gramatura) || 0,
        corId: tecido.corId || '',
        tecidoTipo: tecido.tipo || '',
        cor: (tecido as any).cor?.nome || tecido.nome || '',
        larguraMetros: parseNumber(tecido.larguraMetros) || 0,
        rolos: (tecido as any).rolos ? {
          itens: (tecido as any).rolos.itens?.map((r: any) => ({
            id: r.id,
            tecidoId: r.tecidoId,
            codigoBarraRolo: r.codigoBarraRolo,
            pesoInicialKg: parseNumber(r.pesoInicialKg),
            pesoAtualKg: parseNumber(r.pesoAtualKg),
            situacao: r.situacao
          })) || [],
          pesoTotal: parseNumber((tecido as any).rolos.pesoTotal) || 0,
        } : undefined,
      })) : [],
      direcionamentos: lote.direcionamentos?.map(d => ({
        id: d.id,
        loteProducaoId: d.loteProducaoId,
        tipoServico: d.tipoServico,
        faccaoId: d.faccaoId || '',
        dataSaida: d.dataSaida ? String(d.dataSaida) : '',
        dataPrevisaoRetorno: d.dataPrevisaoRetorno ? String(d.dataPrevisaoRetorno) : '',
        status: d.status as any,
        createdAt: d.createdAt || '',
        updatedAt: d.updatedAt || '',
      })) || [],
    };


    // Chamar handleEdit com o item formatado como TItem (precisa ter id)
    handleEdit({ ...formValues, id: lote.id } as any);
  };



  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  console.log(form.getValues());

  const dataLote = lotesData?.data || [];



  return (
    <main>
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground p-4 items-center">
          {dataLote?.length || 0} lotes cadastrados
        </div>

        {!editingItem && (
          <FormModal
            key={"modal-Add"}
            open={isOpen}
            onSubmit={onSubmit}
            onClose={() => { handleClose(); setCurrentStep(1); }}
            Icon={<ScissorsIcon className="mr-2 h-6 w-6" />}
            title={"Novo Lote "}
            loading={isSubmitting}
            trigger={
              <Button onClick={handleOpen}>
                <Plus className="mr-2 h-4 w-4" /> Novo Lote
              </Button>
            }
          >
            <Form {...form}>
              <div className="flex flex-col h-full min-h-100">
                <div className="mb-6">
                  <StepIndicator
                    currentStep={currentStep}
                    titles={STEPS.map(t => t.title)}
                    totalSteps={totalSteps}
                  />
                </div>

                <div className="flex-1 py-4">
                  {CurrentStepComponent && <CurrentStepComponent />}
                </div>

                <div className="flex justify-between items-center mt-6 border-t pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={currentStep === 1 ? "invisible" : ""}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>

                  {currentStep === totalSteps ? (
                    <Button
                      type="button"
                      onClick={onSubmit}
                      disabled={isSubmitting}
                    >
                      <Save className="mr-2 h-4 w-4" /> Salvar Lote
                    </Button>
                  ) : (
                    <Button type="button" onClick={nextStep}>
                      Próximo <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Form>
          </FormModal>
        )}

        {editingItem && (
          <FormModal
            key={"modal-edit"}
            open={isOpen}
            onClose={handleClose}
            Icon={<ScissorsIcon className="mr-2 h-6 w-6" />}
            title={`Editar Lote ${form.getValues('codigo')}`}
            onSubmit={onSubmit}
            loading={isSubmitting}
          >
            <Form {...form}>
              <LoteProducaoForm isEditing={!!editingItem} />
            </Form>
          </FormModal>
        )}
      </div>

      <div className="hidden md:block">
        <LoteProducaoTable
          lotesProducao={dataLote}
          isLoading={isLoading}
          onView={handleEditLote}
        />
      </div>
    </main>
  )
}