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

import { LoteProducao } from '@/types/production';
import { Factory, Home } from 'lucide-react';
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

interface DirecionamentoFormProps {
  selectedLote: LoteProducao | null;
}

export function DirecionamentoForm({ selectedLote }: DirecionamentoFormProps) {
  const { control, watch, formState: { errors } } = useFormContext<DirecionamentoFormValues>();
  const { faccoes } = useProduction();

  const tipoProducao = watch('tipoProducao');
  const produtos = watch('produtos');

  if (!selectedLote) return null;

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="tipoProducao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Produção</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="interna">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span>Produção Interna</span>
                  </div>
                </SelectItem>
                <SelectItem value="faccao">
                  <div className="flex items-center gap-2">
                    <Factory className="h-4 w-4" />
                    <span>Facção Externa</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {tipoProducao === 'faccao' && (
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
                  {faccoes
                    .filter((f) => f.status === 'ativo')
                    .map((faccao) => (
                      <SelectItem key={faccao.id} value={faccao.id}>
                        {faccao.nome} ({faccao.prazoMedio} dias)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {tipoProducao === 'faccao' && (
        <p className="text-xs text-muted-foreground">
          * O prazo será baseado no prazo médio da facção selecionada. A data de entrega será registrada na conferência.
        </p>
      )}

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
              {selectedLote.grade.map((gradeItem, index) => {
                const formItem = produtos?.find(
                  (p) => p.produto === gradeItem.produto
                );
                return (
                  <tr key={gradeItem.id} className="border-t">
                    <td className="p-2 font-medium">
                      {produtoLabels[gradeItem.produto] || gradeItem.produto}
                    </td>
                    <td className="text-center p-2">{gradeItem.total}</td>
                    <td className="text-center p-2">
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
