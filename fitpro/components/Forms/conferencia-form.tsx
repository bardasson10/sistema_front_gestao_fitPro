'use client';

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
import { Direcionamento } from '@/types/production';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const produtoLabels: Record<string, string> = {
  legging: 'Legging',
  short: 'Short',
  top: 'Top',
  calca: 'Calça',
  conjunto: 'Conjunto',
  body: 'Body',
  macaquinho: 'Macaquinho',
};

interface ConferenciaFormProps {
  direcionamento: Direcionamento | null;
}

export function ConferenciaForm({ direcionamento }: ConferenciaFormProps) {
  const { control, watch } = useFormContext<ConferenciaFormValues>();

  const produtosRecebidos = watch('produtosRecebidos');

  if (!direcionamento) return null;

  return (
    <div className="space-y-4">
      {/* Produtos */}
      <FormItem>
        <FormLabel>Conferência de Produtos</FormLabel>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-2">Produto</th>
                <th className="text-center p-2">Esperado</th>
                <th className="text-center p-2">Recebido</th>
                <th className="text-center p-2">Dif.</th>
              </tr>
            </thead>
            <tbody>
              {direcionamento.produtos.map((item, index) => {
                const recebido = produtosRecebidos?.find(
                  (p) => p.produto === item.produto
                );
                const diff = (recebido?.quantidade || 0) - item.quantidade;
                return (
                  <tr key={item.produto} className="border-t">
                    <td className="p-2 font-medium">
                      {produtoLabels[item.produto] || item.produto}
                    </td>
                    <td className="text-center p-2">{item.quantidade}</td>
                    <td className="text-center p-2">
                      <FormField
                        control={control}
                        name={`produtosRecebidos.${index}.quantidade`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            className="w-20 h-8 mx-auto text-center"
                            value={field.value || 0}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        )}
                      />
                    </td>
                    <td
                      className={`text-center p-2 font-medium ${
                        diff < 0
                          ? 'text-red-600 dark:text-red-400'
                          : diff > 0
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : ''
                      }`}
                    >
                      {diff !== 0 ? (diff > 0 ? '+' : '') + diff : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </FormItem>

      {/* Avaliação de Qualidade */}
      <FormField
        control={control}
        name="avaliacaoQualidade"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Avaliação de Qualidade</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a avaliação" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="aprovado">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Aprovado</span>
                  </div>
                </SelectItem>
                <SelectItem value="parcial">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span>Parcialmente Aprovado</span>
                  </div>
                </SelectItem>
                <SelectItem value="reprovado">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span>Reprovado</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Observações */}
      <FormField
        control={control}
        name="observacoes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Observações sobre a conferência..."
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
