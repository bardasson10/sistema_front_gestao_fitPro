import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import { toast } from 'sonner';
import { PaginatedResponse } from '@/types/production';
import {
    IRequestBodyAddItensLote,
    IRequestBodyAddRolosLote,
    IRequestBodyUpdateLote,
    IRequestBodyCreateLote,
    ILoteResponse,
    IResumoPorCorResponse
} from '@/types/Lote';

export type TFiltroMultiplo = string | string[];

export interface IFiltrosLote {
    status: TFiltroMultiplo;
    responsavelId: TFiltroMultiplo;
    corId: TFiltroMultiplo;
    produtoId: TFiltroMultiplo;
    codigoLote: TFiltroMultiplo;
    dataInicio: TFiltroMultiplo;
    dataFim: TFiltroMultiplo;
    page: number;
    limit: number;
}

export interface IResumoPorCorPaginatedResponse {
    resumo: IResumoPorCorResponse;
    pagination: PaginatedResponse;
}

const defaultResumo: IResumoPorCorResponse = {
    totalGeral: {
        produtos: [],
        tamanhos: [],
        grandTotal: 0,
    },
    cores: [],
};

const defaultPagination: PaginatedResponse = {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
};

const normalizeMultiParam = (value?: TFiltroMultiplo) => {
    if (!value) return undefined;
    if (Array.isArray(value)) {
        const values = value.map((item) => item?.trim()).filter(Boolean);
        return values.length ? values.join(',') : undefined;
    }

    const normalized = value.trim();
    return normalized ? normalized : undefined;
};

const buildLoteParams = (filtros?: Partial<IFiltrosLote>) => ({
    status: normalizeMultiParam(filtros?.status),
    codigoLote: normalizeMultiParam(filtros?.codigoLote),
    responsavelId: normalizeMultiParam(filtros?.responsavelId),
    corId: normalizeMultiParam(filtros?.corId),
    produtoId: normalizeMultiParam(filtros?.produtoId),
    dataInicio: normalizeMultiParam(filtros?.dataInicio),
    dataFim: normalizeMultiParam(filtros?.dataFim),
    page: filtros?.page,
    limit: filtros?.limit,
});
export const useGetListAllLotes = (filtros?: Partial<IFiltrosLote>) => {
    return useQuery({
        queryKey: ['lotes-producao', 'list-all' , filtros],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: ILoteResponse[]; pagination: PaginatedResponse }>(
                `/lotes-producao`
                , 
                {
                    params: buildLoteParams(filtros),
                }
            );
            return data.data
        },
        placeholderData: [],
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: false,
    });
};

export const useGetResumoPorCor = (filtros?: Partial<IFiltrosLote>) => {
    return useQuery({
        queryKey: ['lotes-producao', 'resumo-por-cor', filtros],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data?: IResumoPorCorResponse; pagination?: PaginatedResponse } | IResumoPorCorResponse>(
                `/lotes-producao/resumo-por-cor`,
                {
                    params: buildLoteParams(filtros),
                }
            );

            // Aceita os dois formatos de resposta: direto ou envelopado em { data: ... }.
            if (data && typeof data === 'object' && 'totalGeral' in data && 'cores' in data) {
                return {
                    resumo: data as IResumoPorCorResponse,
                    pagination: defaultPagination,
                };
            }

            if (data && typeof data === 'object' && 'data' in data) {
                return {
                    resumo: data.data || defaultResumo,
                    pagination: data.pagination || defaultPagination,
                };
            }

            return {
                resumo: defaultResumo,
                pagination: defaultPagination,
            };
        },
        placeholderData: {
            resumo: defaultResumo,
            pagination: defaultPagination,
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: false,
    });
};

export const useGetByIdLote = (id: string) => {
    return useQuery({
        queryKey: ['lotes-producao', id],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: ILoteResponse[]; pagination: PaginatedResponse }>(`/lotes-producao/${id}`);
            return data as { data: ILoteResponse[]; pagination: PaginatedResponse };
        },
        enabled: !!id,
    });
};



export const usePostCreateLoteProducao = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ body }: { body: IRequestBodyCreateLote }) => {
            const { data } = await apiClient.post<ILoteResponse>('/lotes-producao', body);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lotes-producao'] });
            toast.success('Lote de produção criado com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);
        },
    });
};



export const usePostAddItensLote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            enfestos,
        }: {
            id: string;
            enfestos: IRequestBodyAddItensLote[]
        }) => {
            const { data } = await apiClient.post(
                `/lotes-producao/${id}/items`,
                { enfestos }
            );

            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lotes-producao'] });
            queryClient.invalidateQueries({ queryKey: ['lotes-producao', variables.id] });

            toast.success('Itens adicionados ao lote com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);;
        },
    });
};




export const usePostAddRolosLote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            payload,
        }: {
            id: string;
            payload: IRequestBodyAddRolosLote
        }) => {
            const { data } = await apiClient.post(
                `/lotes-producao/${id}/rolos`,
                { rolos: payload.rolosProducao }
            );

            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lotes-producao'] });
            queryClient.invalidateQueries({ queryKey: ['lotes-producao', variables.id] });

            toast.success('Itens adicionados ao lote com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);;
        },
    });
};


export const useDeleteRoloLote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, estoqueRoloId }: { id: string; estoqueRoloId: string }) => {
            await apiClient.delete(`/lotes-producao/${id}/rolos/${estoqueRoloId}`);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lotes-producao'] });
            queryClient.invalidateQueries({ queryKey: ['lotes-producao', variables.id] });
            toast.success('Rolo removido do lote com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error ||
                'Erro ao remover rolo do lote';
            toast.error(mensagem);
        },
    });
};


export const usePostUpdateLote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, dados }: { id: string; dados: IRequestBodyUpdateLote }) => {
            const { data } = await apiClient.put<ILoteResponse>(`/lotes-producao/${id}`, dados);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['lotes-producao'] });
            queryClient.invalidateQueries({ queryKey: ['lotes-producao', data.id] });
            toast.success('Lote de produção atualizado com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);
        },
    });
};

export const usePostDeleteLote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/lotes-producao/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lotes-producao'] });
            toast.success('Lote de produção deletado com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);
        },
    });
};
