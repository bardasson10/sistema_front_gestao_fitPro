'use client';

import { useFormContext } from 'react-hook-form';
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

import { Faccao, LoteProducao } from '@/types/production';
import { useProduction } from '@/providers/PrivateContexts/ProductionProvider';

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
  produto: string;
  total: number;
}

interface DirecionamentoFormProps {
  selectedLote?: LoteProducao | null;
  produtosDisponiveis?: ProdutoDisponivel[];
  faccoes?: Faccao[];
}

export function DirecionamentoForm({ selectedLote, produtosDisponiveis, faccoes }: DirecionamentoFormProps) {
  const { control, watch, formState: { errors } } = useFormContext<DirecionamentoFormValues>();
  const production = useProduction();
  const faccoesDisponiveis = faccoes || production.faccoes;

  const produtos = watch('produtos');

  const produtosBase =
    produtosDisponiveis ||
    (selectedLote?.grade ?? []).map((item) => ({
      id: item.id,
      produto: item.produto,
      total: item.total,
    }));

  if (!produtosBase?.length) return null;

  return (
    <div className="space-y-4">
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
                  { value: "costura", label: "Costura" },
                  { value: "estampa", label: "Estampa" },
                  { value: "tingimento", label: "Tingimento" },
                  { value: "acabamento", label: "Acabamento" },
                  { value: "corte", label: "Corte" },
                  { value: "outro", label: "Outro" },
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

      <p className="text-xs text-muted-foreground">
        * O prazo sera baseado no prazo medio da faccao selecionada. A data de entrega sera registrada na conferencia.
      </p>

      <FormItem>
        <FormLabel>Produtos a Enviar</FormLabel>
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
              {(produtosBase ?? []).map((gradeItem, index) => {
                const formItem = produtos?.find(
                  (p) => p.produto === gradeItem.produto
                );
                return (
                  <tr key={gradeItem.id || gradeItem.produto} className="border-t">
                    <td className="p-2 font-medium">
                      {produtoLabels[gradeItem.produto] || gradeItem.produto}
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
                );
              })}
            </tbody>
          </table>
        </div>
        {errors.produtos && (
          <p className="text-sm font-medium text-destructive">
            {errors.produtos.message as string}
          </p>
        )}
      </FormItem>
    </div>
  );
}
