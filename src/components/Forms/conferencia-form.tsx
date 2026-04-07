'use client';

import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { ConferenciaFormValues } from '@/schemas/conferencia-schema';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
interface ConferenciaFormProps {
  items?: Array<{
    tamanho?: { id: string; nome: string };
    quantidadePlanejada?: number;
    qtdRecebida?: number;
    qtdDefeito?: number;
  }>;
}

export function ConferenciaForm({ items = [] }: ConferenciaFormProps) {
  const { control, watch, setValue, formState: { errors } } = useFormContext<ConferenciaFormValues>();
  const formItems = watch('items');
  const statusQualidade = watch('statusQualidade');
  const isPagamentoEditavel = statusQualidade === 'aprovado';
  const liberarAutomatico = statusQualidade === 'aprovado_parcial' || statusQualidade === 'aprovado_defeito';
  const liberadoPagamento = watch('liberadoPagamento');

  useEffect(() => {
    if (liberarAutomatico) {
      setValue('liberadoPagamento', true);
      return;
    }

    if (!isPagamentoEditavel && liberadoPagamento) {
      setValue('liberadoPagamento', false);
    }
  }, [isPagamentoEditavel, liberarAutomatico, liberadoPagamento, setValue]);

  return (
    <div className="space-y-4">
      {/* Items - Quantidades por Tamanho */}
      <FormItem>
        <FormLabel>Comparação de Quantidades por Tamanho</FormLabel>
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">Tamanho</th>
                <th className="text-center p-3">
                  <span className="block text-xs font-medium">Enviadas</span>
                  <span className="text-xs text-muted-foreground">(Planejado)</span>
                </th>
                <th className="text-center p-3">
                  <span className="block text-xs font-medium">Recebidas</span>
                  <span className="text-xs text-muted-foreground">(Conferência)</span>
                </th>
                <th className="text-center p-3">
                  <span className="block text-xs font-medium">Defeituosas</span>
                  <span className="text-xs text-muted-foreground">(Não OK)</span>
                </th>
                <th className="text-center p-3">
                  <span className="block text-xs font-medium">Diferença</span>
                  <span className="text-xs text-muted-foreground">(Status)</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const qtdPlanejada = item.quantidadePlanejada || 0;
                const qtdRecebida = formItems?.[index]?.qtdRecebida || 0;
                const qtdDefeito = formItems?.[index]?.qtdDefeito || 0;
                const total = qtdRecebida + qtdDefeito;
                const diferenca = qtdPlanejada - total;
                
                let statusColor = 'bg-green-50 dark:bg-green-950';
                let statusText = 'text-green-700 dark:text-green-300';
                let statusLabel = 'OK';
                
                if (diferenca > 0) {
                  statusColor = 'bg-red-50 dark:bg-red-950';
                  statusText = 'text-red-700 dark:text-red-300';
                  statusLabel = `-${diferenca}`;
                } else if (diferenca < 0) {
                  statusColor = 'bg-blue-50 dark:bg-blue-950';
                  statusText = 'text-blue-700 dark:text-blue-300';
                  statusLabel = `+${Math.abs(diferenca)}`;
                }

                return (
                  <tr key={item.tamanho?.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{item.tamanho?.nome || '-'}</td>
                    <td className="text-center p-3">
                      <span className="font-bold text-base">{qtdPlanejada}</span>
                    </td>
                    <td className="text-center p-3">
                      <FormField
                        control={control}
                        name={`items.${index}.qtdRecebida`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            className="w-24 h-9 mx-auto text-center font-medium"
                            value={field.value || 0}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        )}
                      />
                      <FormField
                        control={control}
                        name={`items.${index}.tamanhoId`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="hidden"
                            value={item.tamanho?.id || ''}
                          />
                        )}
                      />
                    </td>
                    <td className="text-center p-3">
                      <FormField
                        control={control}
                        name={`items.${index}.qtdDefeito`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            className="w-24 h-9 mx-auto text-center font-medium"
                            value={field.value || 0}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        )}
                      />
                    </td>
                    <td className={`text-center p-3 ${statusColor}`}>
                      <span className={`font-bold text-sm ${statusText}`}>
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {errors.items && (
          <p className="text-sm font-medium text-destructive mt-2">
            {errors.items.message as string}
          </p>
        )}
      </FormItem>

      {/* Status de Qualidade */}
      <FormField
        control={control}
        name="statusQualidade"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status de Qualidade</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="recebido">Recebido</SelectItem>
                <SelectItem value="em_conferencia">Em Conferência</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="aprovado_parcial">Aprovado Parcial</SelectItem>
                <SelectItem value="aprovado_defeito">Aprovado Defeito</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Liberado para Pagamento */}
      <FormField
        control={control}
        name="liberadoPagamento"
        render={({ field }) => (
          <FormItem className="flex items-center gap-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={!isPagamentoEditavel}
              />
            </FormControl>
            <FormLabel className="mt-0!">Liberar para Pagamento</FormLabel>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Observações */}
      <FormField
        control={control}
        name="observacao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Observações sobre a conferência..."
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
