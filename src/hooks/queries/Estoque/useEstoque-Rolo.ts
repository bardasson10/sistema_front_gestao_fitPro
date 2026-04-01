import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import { toast } from 'sonner';
import { PaginatedResponse } from '@/types/production';
import { EstoqueRolo, IFiltroEstoqueRolo, IKPIEstoqueRolo, IResumoEstoqueRolo, SituacaoRolo } from '@/types/EstoqueRolo';




export const useGetListAllEstoqueRolo = (
    filtros?: IFiltroEstoqueRolo,
    options?: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: ['estoque-rolos', 'list', filtros],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: EstoqueRolo[], pagination: PaginatedResponse }>(
                '/estoque-rolos',
                { params: filtros }
            );
            return data;
        },
        enabled: options?.enabled ?? true,
    });
};

export const useGetListAllEstoqueRoloCompleto = (
    filtros?: IFiltroEstoqueRolo,
    options?: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: ['estoque-rolos', 'list-all', filtros],
        queryFn: async () => {
            const parsedLimit = Number(filtros?.limit);
            const pageSize = parsedLimit > 0 ? parsedLimit : 100;

            const { data: firstPage } = await apiClient.get<{ data: EstoqueRolo[]; pagination: PaginatedResponse }>(
                '/estoque-rolos',
                {
                    params: {
                        ...filtros,
                        page: 1,
                        limit: pageSize,
                    },
                }
            );

            const totalPages = Math.max(firstPage?.pagination?.pages || 1, 1);
            if (totalPages === 1) {
                return firstPage;
            }

            const pageRequests: Promise<{ data: EstoqueRolo[]; pagination: PaginatedResponse }>[] = [];
            for (let page = 2; page <= totalPages; page += 1) {
                pageRequests.push(
                    apiClient
                        .get<{ data: EstoqueRolo[]; pagination: PaginatedResponse }>('/estoque-rolos', {
                            params: {
                                ...filtros,
                                page,
                                limit: pageSize,
                            },
                        })
                        .then((response) => response.data)
                );
            }

            const remainingPages = await Promise.all(pageRequests);
            const mergedData = [
                ...firstPage.data,
                ...remainingPages.flatMap((pageResult) => pageResult.data || []),
            ];

            return {
                ...firstPage,
                data: mergedData,
                pagination: {
                    ...firstPage.pagination,
                    page: 1,
                    pages: 1,
                    limit: mergedData.length,
                    total: mergedData.length,
                },
            };
        },
        enabled: options?.enabled ?? true,
    });
};

export const useGetResumeEstoqueRolo = (filtros?: IFiltroEstoqueRolo, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['estoque-rolos', 'resumo', filtros],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: IResumoEstoqueRolo, pagination: PaginatedResponse }>(
                '/estoque-rolos/resumo',
                { params: filtros }
            );
            return data;
        },
        enabled: options?.enabled ?? true,
    });
};

export const useGetKPIsEstoqueRolo = (filtros?: IFiltroEstoqueRolo, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['estoque-rolos', 'kpi', filtros],
        queryFn: async () => {
            const { data } = await apiClient.get<IKPIEstoqueRolo>(
                '/estoque-rolos/relatorio/geral',
                { params: filtros }
            );
            return data;
        },
        enabled: options?.enabled ?? true,
    });
};

export const useGetListByIdEstoqueRolo = (id: string) => {
    return useQuery({
        queryKey: ['estoque-rolos', id],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: EstoqueRolo, pagination: PaginatedResponse }>(`/estoque-rolos/${id}`);
            return data;
        },
        enabled: !!id,
    });
};



interface ICriarEstoqueLotePayload {
    tecidoId: string;
    prefixo: string;
    situacao: Exclude<SituacaoRolo, 'esgotado'>;
    dataLote: string;
    rolos: Array<{
        pesoInicialKg: number;
    }>;
}

export const usePostCreateEstoqueRolo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dados: ICriarEstoqueLotePayload) => {
            const { data } = await apiClient.post<{ data: EstoqueRolo }>('/estoque-rolos', dados);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['estoque-rolos'] });
            toast.success('Rolos adicionados ao estoque com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Erro ao adicionar rolo ao estoque');
        },
    });
};


interface IAtualizarEstoqueRoloBody {
    pesoAtualKg: number;
    situacao: SituacaoRolo;
}

export const usePutEstoqueRolo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...dados }: { id: string; } & IAtualizarEstoqueRoloBody) => {
            const { data } = await apiClient.put<{ data: EstoqueRolo }>(`/estoque-rolos/${id}`, dados);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['estoque-rolos'] });
            queryClient.invalidateQueries({ queryKey: ['estoque-rolos', data.data.id] });
            toast.success('Rolo atualizado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Erro ao atualizar rolo');
        },
    });
};

export const useDeleteEstoqueRolo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/estoque-rolos/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['estoque-rolos'] });
            toast.success('Rolo deletado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Erro ao deletar rolo');
        },
    });
};