'use client';

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
import { Fornecedor, Cor } from '@/types/production';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const tecidoFiltersSchema = z.object({
    fornecedorId: z.string().optional(),
    corId: z.string().optional(),
    nome: z.string().optional(),
    codigoReferencia: z.string().optional(),
    gramatura: z.number().optional(),
});

export type TecidoFiltersValues = z.infer<typeof tecidoFiltersSchema>;

interface TecidoFiltersProps {
    fornecedores: Fornecedor[];
    cores: Cor[];
    onFilter: (filters: TecidoFiltersValues) => void;
    onClear: () => void;
}

export function TecidoFilters({
    fornecedores,
    cores,
    onFilter,
    onClear,
}: TecidoFiltersProps) {
    const form = useForm<TecidoFiltersValues>({
        resolver: zodResolver(tecidoFiltersSchema),
        defaultValues: {
            fornecedorId: undefined,
            corId: undefined,
            nome: undefined,
            codigoReferencia: undefined,
            gramatura: undefined,
        },
    });

    const handleSubmit = (values: TecidoFiltersValues) => {
        onFilter(values);
    };

    const handleClear = () => {
        form.reset({
            fornecedorId: undefined,
            corId: undefined,
            nome: undefined,
            codigoReferencia: undefined,
            gramatura: undefined,
        });
        onClear();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Nome */}
                    <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs">Nome</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Filtrar por nome"
                                        value={field.value ?? ''}
                                        onChange={(e) => field.onChange(e.target.value || undefined)}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Código Referência */}
                    <FormField
                        control={form.control}
                        name="codigoReferencia"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs">Código Ref.</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Filtrar por código"
                                        value={field.value ?? ''}
                                        onChange={(e) => field.onChange(e.target.value || undefined)}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Fornecedor */}
                    <FormField
                        control={form.control}
                        name="fornecedorId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs">Fornecedor</FormLabel>
                                <Select value={field.value ?? ''} onValueChange={(value) => field.onChange(value || undefined)}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecionar..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {fornecedores?.map((f) => (
                                            <SelectItem key={f.id} value={f.id}>
                                                {f.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />

                    {/* Cor */}
                    <FormField
                        control={form.control}
                        name="corId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs">Cor</FormLabel>
                                <Select value={field.value ?? ''} onValueChange={(value) => field.onChange(value || undefined)}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecionar..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {cores?.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 rounded border"
                                                        style={{ backgroundColor: c.codigoHex }}
                                                    />
                                                    {c.nome}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />

                    {/* Gramatura */}
                    <FormField
                        control={form.control}
                        name="gramatura"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs">Gramatura</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Filtrar por gramatura"
                                        value={field.value ?? ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value ? parseFloat(value) : undefined);
                                        }}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Botões */}
                <div className="flex gap-2">
                    <Button type="submit" variant="default">
                        Filtrar
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClear}
                    >
                        <X className="mr-2 h-4 w-4" />
                        Limpar Filtros
                    </Button>
                </div>
            </form>
        </Form>
    );
}
