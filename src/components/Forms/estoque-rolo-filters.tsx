'use client';

import { useMemo, useState } from 'react';
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
import { cn } from '@/lib/utils';

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

  function SearchablePopoverSelect<T extends { id: string; label: string; color?: string }>({
    label,
    options,
    value,
    onChange,
    placeholder,
    disabled,
  }: {
    label: string;
    options: T[];
    value?: string | undefined;
    onChange: (v?: string) => void;
    placeholder?: string;
    disabled?: boolean;
  }) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
      const term = search.trim().toLowerCase();
      if (!term) return options;
      return options.filter((o) => o.label.toLowerCase().includes(term));
    }, [options, search]);

    const selectedLabel = options.find((o) => o.id === value)?.label ?? 'Todos';

    return (
      <div>
        <label className="text-xs">{label}</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn('h-10 w-full justify-between text-left font-normal', disabled && 'opacity-60')} disabled={disabled}>
              <span className="truncate">{label}: {selectedLabel}</span>
              <span className="text-xs text-muted-foreground">Selecionar</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start">
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">{label}</p>
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={placeholder} />
              </div>
              <div className="max-h-56 overflow-auto rounded-md border">
                <button type="button" onClick={() => onChange(undefined)} className={"flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"}>
                  <span>Todos</span>
                </button>
                {filtered.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum resultado</div>
                ) : (
                  filtered.map((opt) => (
                    <button key={opt.id} type="button" onClick={() => onChange(opt.id)} className={"flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"}>
                      <span className="flex items-center gap-2">
                        {opt.color ? <span className="h-2.5 w-2.5 rounded-full border" style={{ backgroundColor: opt.color }} /> : null}
                        <span className="truncate">{opt.label}</span>
                      </span>
                      {opt.id === value ? <span className="text-xs text-muted-foreground">Selecionado</span> : null}
                    </button>
                  ))
                )}
              </div>
              {value ? (
                <Button type="button" variant="ghost" className="w-full" onClick={() => onChange(undefined)}>
                  Limpar seleção
                </Button>
              ) : null}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

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
                <SearchablePopoverSelect
                  label="Cor"
                  options={(coresData || []).map((c) => ({ id: c.id, label: c.nome, color: c.codigoHex }))}
                  value={field.value}
                  onChange={(v) => field.onChange(v || undefined)}
                  placeholder="Buscar cor"
                />
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
                <SearchablePopoverSelect
                  label="Fornecedor"
                  options={(fornecedoresData || []).map((f) => ({ id: f.id ?? '', label: f.nome }))}
                  value={field.value}
                  onChange={(v) => field.onChange(v || undefined)}
                  placeholder="Buscar fornecedor"
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tecidoId"
            render={({ field }) => (
              <FormItem className="w-full">
                <SearchablePopoverSelect
                  label="Tecido"
                  options={tecidosFiltrados.map((t) => ({ id: t.id, label: `${t.nome} - ${t.corNome}`, color: t.corHex }))}
                  value={field.value}
                  onChange={(v) => field.onChange(v || undefined)}
                  placeholder="Buscar tecido"
                  disabled={!fornecedorSelecionado}
                />
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