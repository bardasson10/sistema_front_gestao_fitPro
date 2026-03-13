'use client';

import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { DirecionamentoFormValues } from '@/schemas/direcionamento-schema';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { Faccao, LoteProducao } from '@/types/production';
import { useProduction } from '@/providers/PrivateContexts/ProductionProvider';
import { Plus, Trash2 } from 'lucide-react';
import { DirecionamentoGradeView } from './direcionamento-gradeView';
import { ApiLoteProducaoResponse } from '@/hooks/queries/useProducao';

const produtoLabels: Record<string, string> = {
  legging: 'Legging',
  short: 'Short',
  top: 'Top',
  calca: 'Calça',
  conjunto: 'Conjunto',
  body: 'Body',
  macaquinho: 'Macaquinho',
};

interface ProdutoDisponivel {
  id?: string;
  produto?: string;
  total: number;
}

interface DirecionamentoFormProps {
  selectedLote?: ApiLoteProducaoResponse
  produtosDisponiveis?: ProdutoDisponivel[];
  faccoes?: Faccao[];
  isCreateMode?: boolean;
  numPecas: number;
}

export function DirecionamentoForm({ selectedLote, produtosDisponiveis, faccoes, isCreateMode = false, numPecas }: DirecionamentoFormProps) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<DirecionamentoFormValues>();
  const production = useProduction();
  const faccoesDisponiveis = faccoes || production.faccoes;

  const produtos = watch('produtos');
  const direcionamentos = watch('direcionamentos') || [];

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'direcionamentos',
  });

  useEffect(() => {
    if (!isCreateMode) return;
    const firstDirecionamento = direcionamentos[0];
    if (!firstDirecionamento) return;

    const currentFaccaoId = watch('faccaoId');
    const currentTipoServico = watch('tipoServico');

    if (firstDirecionamento.faccaoId !== currentFaccaoId) {
      setValue('faccaoId', firstDirecionamento.faccaoId || '');
    }

    if (firstDirecionamento.tipoServico !== currentTipoServico) {
      setValue('tipoServico', firstDirecionamento.tipoServico || 'costura');
    }
  }, [direcionamentos, isCreateMode, setValue, watch]);

  const produtosBase =
    produtosDisponiveis ||
    (selectedLote?.materiais?.flatMap((m) => m.cores?.flatMap((c) => c.gradeLote) || []) ?? []).map((item) => ({
      id: item?.produtoId,
      produto: item?.produto?.tipoProdutoId,
      total: item?.quantidadePlanejada || 0,
    }));

  return (
    <div className="space-y-4">
      {isCreateMode ? (
        <>
          <p className="text-sm text-muted-foreground">
            {numPecas} peças disponíveis
          </p>

          <div className="flex items-center justify-between">

            <FormLabel>Partes do Direcionamento</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  faccaoId: '',
                  tipoServico: 'costura',
                  quantidade: 1,
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Parte
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 gap-3 rounded-lg border p-3 md:grid-cols-[1fr_1fr_140px_auto] md:items-end">
                <FormField
                  control={control}
                  name={`direcionamentos.${index}.faccaoId`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>Facção</FormLabel>
                      <Select value={formField.value || ''} onValueChange={formField.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a facção" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {faccoesDisponiveis
                            .filter((f) => f.status === 'ativo')
                            .map((faccao) => (
                              <SelectItem key={faccao.id} value={faccao.id}>
                                {faccao.nome} ({faccao.prazoMedioDias || faccao.prazoMedio || 7} dias)
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`direcionamentos.${index}.tipoServico`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>Tipo de Serviço</FormLabel>
                      <Select value={formField.value} onValueChange={formField.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o serviço" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[
                            { value: 'costura', label: 'Costura' },
                            { value: 'estampa', label: 'Estampa' },
                            { value: 'tingimento', label: 'Tingimento' },
                            { value: 'acabamento', label: 'Acabamento' },
                            { value: 'corte', label: 'Corte' },
                            { value: 'outro', label: 'Outro' },
                          ].map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`direcionamentos.${index}.quantidade`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          value={formField.value || 1}
                          onChange={(e) => formField.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  disabled={fields.length <= 1}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <FormField
            control={control}
            name="tipoServico"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Serviço</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[
                      { value: 'costura', label: 'Costura' },
                      { value: 'estampa', label: 'Estampa' },
                      { value: 'tingimento', label: 'Tingimento' },
                      { value: 'acabamento', label: 'Acabamento' },
                      { value: 'corte', label: 'Corte' },
                      { value: 'outro', label: 'Outro' },
                    ].map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="faccaoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facção</FormLabel>
                <Select value={field.value || ''} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a facção" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {faccoesDisponiveis
                      .filter((f) => f.status === 'ativo')
                      .map((faccao) => (
                        <SelectItem key={faccao.id} value={faccao.id}>
                          {faccao.nome} ({faccao.prazoMedioDias || faccao.prazoMedio || 7} dias)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {selectedLote?.materiais && (
        <div className="pt-4 border-t">
          <DirecionamentoGradeView materiais={selectedLote.materiais} />
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        * O prazo será baseado no prazo médio da facção selecionada.
      </p>

      {!isCreateMode && produtosBase?.length ? (
        <FormItem>
          <FormLabel>Produtos do Lote</FormLabel>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2">Produto</th>
                  <th className="text-center p-2">Disponível</th>
                  <th className="text-center p-2">Enviar</th>
                </tr>
              </thead>
              <tbody>
                {(produtosBase ?? []).map((gradeItem, index) => (
                  <tr key={gradeItem.id || gradeItem.produto || `produto-${index}`} className="border-t">
                    <td className="p-2 font-medium">
                      {(gradeItem.produto ? produtoLabels[gradeItem.produto] : undefined) || gradeItem.produto || '-'}
                    </td>
                    <td className="text-center p-2">{gradeItem.total}</td>
                    <td className="text-center p-2">
                      <FormField
                        control={control}
                        name={`produtos.${index}.produto`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="hidden"
                            value={field.value || gradeItem.produto}
                          />
                        )}
                      />
                      <FormField
                        control={control}
                        name={`produtos.${index}.quantidade`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            max={gradeItem.total}
                            className="w-20 h-8 mx-auto text-center"
                            value={field.value || 0}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        )}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {errors.produtos && (
            <p className="text-sm font-medium text-destructive">
              {errors.produtos.message as string}
            </p>
          )}
        </FormItem>
      ) : null}
    </div>
  );
}
