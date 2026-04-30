'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X } from 'lucide-react';
import { IFiltroEstoqueRolo } from '@/types/EstoqueRolo';
import { useCores, useFornecedores, useTecidos } from '@/hooks/queries/useMateriais';
import { useTamanhos } from '@/hooks/queries/useProdutos';
import { useLotesProducaoCompleto } from '@/hooks/queries/useProducao';

const estoqueRoloFiltersSchema = z.object({
  estoqueRoloId: z.string().optional(),
  tipoMovimentacao: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  tecidoId: z.string().optional(),
  fornecedorId: z.string().optional(),
  corId: z.string().optional(),
  tamanhoId: z.string().optional(),
  loteProducaoId: z.string().optional(),
  codigoLote: z.string().optional(),
});

export type EstoqueRoloFiltersValues = z.infer<typeof estoqueRoloFiltersSchema>;

interface EstoqueRoloFiltersProps {
  onFilter: (filters: IFiltroEstoqueRolo) => void;
  onClear: () => void;
}

const tipoMovimentacaoOptions = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'saida', label: 'Saída' },
];

export function EstoqueRoloFilters({ onFilter, onClear }: EstoqueRoloFiltersProps) {
  const form = useForm<EstoqueRoloFiltersValues>({
    resolver: zodResolver(estoqueRoloFiltersSchema),
    defaultValues: {
      estoqueRoloId: undefined,
      tipoMovimentacao: undefined,
      dataInicio: undefined,
      dataFim: undefined,
      tecidoId: undefined,
      fornecedorId: undefined,
      corId: undefined,
      tamanhoId: undefined,
      loteProducaoId: undefined,
      codigoLote: undefined,
    },
  });

  const { data: fornecedoresData } = useFornecedores();
  const { data: coresData } = useCores();
  const { data: tecidosResponse } = useTecidos();
  const { data: tamanhosData } = useTamanhos();
  const { data: lotesResponse } = useLotesProducaoCompleto({ limit: 1000 });

  const coresMap = useMemo(
    () => new Map((coresData || []).map((cor) => [cor.id, cor])),
    [coresData]
  );

  const tecidos = useMemo(
    () =>
      (tecidosResponse?.data || []).map((tecido) => ({
        ...tecido,
        fornecedorId: tecido.fornecedorId ?? '',
        corNome: coresMap.get(tecido.corId)?.nome ?? 'Sem cor',
        corHex: coresMap.get(tecido.corId)?.codigoHex ?? '#D4D4D8',
      })),
    [tecidosResponse?.data, coresMap]
  );

  const fornecedorSelecionado = form.watch('fornecedorId');

  const tecidosFiltrados = useMemo(() => {
    if (!fornecedorSelecionado) {
      return tecidos;
    }

    return tecidos.filter((tecido) => tecido.fornecedorId === fornecedorSelecionado);
  }, [fornecedorSelecionado, tecidos]);

  const lotes = useMemo(() => lotesResponse?.data || [], [lotesResponse?.data]);

  const formatDateLabel = (value?: string) => {
    if (!value) return 'Selecionar data';

    const parsedDate = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) return 'Selecionar data';

    return format(parsedDate, 'dd/MM/yyyy');
  };

  const handleSubmit = (values: EstoqueRoloFiltersValues) => {
    onFilter({
      estoqueRoloId: values.estoqueRoloId || undefined,
      tipoMovimentacao: values.tipoMovimentacao || undefined,
      dataInicio: values.dataInicio || undefined,
      dataFim: values.dataFim || undefined,
      tecidoId: values.tecidoId || undefined,
      fornecedorId: values.fornecedorId || undefined,
      corId: values.corId || undefined,
      tamanhoId: values.tamanhoId || undefined,
      loteProducaoId: values.loteProducaoId || undefined,
      codigoLote: values.codigoLote || undefined,
    });
  };

  const handleClear = () => {
    form.reset({
      estoqueRoloId: undefined,
      tipoMovimentacao: undefined,
      dataInicio: undefined,
      dataFim: undefined,
      tecidoId: undefined,
      fornecedorId: undefined,
      corId: undefined,
      tamanhoId: undefined,
      loteProducaoId: undefined,
      codigoLote: undefined,
    });
    onClear();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <FormField
            control={form.control}
            name="estoqueRoloId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs">ID do Rolo</FormLabel>
                <FormControl>
                  <Input
                    className="w-full"
                    placeholder="Filtrar por ID"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value || undefined)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="corId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs">Cor</FormLabel>
                <Select value={field.value ?? ''} onValueChange={(value) => field.onChange(value || undefined)}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(coresData || []).map((cor) => (
                      <SelectItem key={cor.id} value={cor.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full border"
                            style={{ backgroundColor: cor.codigoHex }}
                          />
                          {cor.nome}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tamanhoId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs">Tamanho</FormLabel>
                <Select value={field.value ?? ''} onValueChange={(value) => field.onChange(value || undefined)}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(tamanhosData || []).map((tamanho) => (
                      <SelectItem key={tamanho.id} value={tamanho.id}>
                        {tamanho.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="loteProducaoId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs">Lote</FormLabel>
                <Select value={field.value ?? ''} onValueChange={(value) => field.onChange(value || undefined)}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {lotes.map((lote) => (
                      <SelectItem key={lote.id} value={lote.id}>
                        {lote.codigoLote}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="codigoLote"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs">Código do Lote</FormLabel>
                <FormControl>
                  <Input
                    className="w-full"
                    placeholder="Filtrar por código"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value || undefined)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fornecedorId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs">Fornecedor</FormLabel>
                <Select value={field.value ?? ''} onValueChange={(value) => field.onChange(value || undefined)}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(fornecedoresData || []).map((fornecedor) => (
                      <SelectItem key={fornecedor.id ?? fornecedor.nome} value={fornecedor.id ?? ''}>
                        {fornecedor.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tecidoId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs">Tecido</FormLabel>
                <Select value={field.value ?? ''} onValueChange={(value) => field.onChange(value || undefined)}>
                  <FormControl>
                    <SelectTrigger className="w-full" disabled={!fornecedorSelecionado}>
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tecidosFiltrados.map((tecido) => (
                      <SelectItem key={tecido.id} value={tecido.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full border"
                            style={{ backgroundColor: tecido.corHex }}
                          />
                          {tecido.nome} - {tecido.corNome}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipoMovimentacao"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs">Tipo de Movimentação</FormLabel>
                <Select value={field.value ?? ''} onValueChange={(value) => field.onChange(value || undefined)}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tipoMovimentacaoOptions.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataInicio"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs">Data Inicial</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className="w-full justify-between font-normal">
                        {formatDateLabel(field.value)}
                        <CalendarIcon className="h-4 w-4 opacity-60" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(`${field.value}T00:00:00`) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : undefined)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataFim"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs">Data Final</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className="w-full justify-between font-normal">
                        {formatDateLabel(field.value)}
                        <CalendarIcon className="h-4 w-4 opacity-60" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(`${field.value}T00:00:00`) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : undefined)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
        </div>

        <div className="flex w-full flex-wrap gap-2 pt-1">
          <Button type="submit">Filtrar</Button>
          <Button type="button" variant="outline" size="sm" onClick={handleClear}>
            <X className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      </form>
    </Form>
  );
}