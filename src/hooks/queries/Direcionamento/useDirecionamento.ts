import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import { toast } from 'sonner';
import { PaginatedResponse } from '@/types/production';
import { EstoqueCorte } from '@/types/EstoqueCorte';
import {
    DirecionamentoPutItensRequestBodyPayload,
    DirecionamentoPutRequestBodyPayload,
    DirecionamentoPutSkuPriceRequestBodyPayload,
    DirecionamentoPutStatusRequestBodyPayload,
    DirecionamentoRemessa,
    DirecionamentoRequestBodyPayload,
} from '@/types/Direcionamento';


interface IFiltrosDirecionamento {
    status?: string;
    faccaoId?: string;
    page?: number;
    limit?: number;
}

interface IFiltrosEstoqueCorte {
    produtoId?: string;
    loteProducaoId?: string;
    tamanhoId?: string;
    corId?: string;
    page?: number;
    limit?: number;
}

interface IUseEstoqueCorteOptions {
    enabled?: boolean;
}



export const useGetDirecionamentos = (filtros?: IFiltrosDirecionamento) => {
    return useSuspenseQuery({
        queryKey: ['direcionamentos', 'listAll', filtros],
        queryFn: async () => {

            const { data } = await apiClient.get<{ data: DirecionamentoRemessa[], pagination: PaginatedResponse }>(
                `/direcionamentos`,
                {
                    params:  filtros ,

                }
            );
            return {
                data: data.data,
                pagination: data.pagination,
            };
        },
    });
};

interface IFiltrosDirecionamentoPronto {
    page?: number;
    limit?: number;
}

export const useGetRemessasProntas = (filtros?: IFiltrosDirecionamentoPronto) => {
    return useSuspenseQuery({
        queryKey: ['direcionamentos', 'prontas', filtros],
        queryFn: async () => {

            const { data } = await apiClient.get<{ data: DirecionamentoRemessa[], pagination: PaginatedResponse }>(
                `/direcionamentos/prontas`,
                {
                    params:  filtros ,
                }
            );
            return data.data;
        },
    });
};

export const useGetDirecionamento = (id: string) => {
    return useSuspenseQuery({
        queryKey: ['direcionamentos', id],
        queryFn: async () => {
            const { data } = await apiClient.get<
                { data: DirecionamentoRemessa | DirecionamentoRemessa[]; pagination?: PaginatedResponse } | DirecionamentoRemessa | DirecionamentoRemessa[]
            >(`/direcionamentos/${id}`);

            const payload = data as any;
            const direcionamento = payload && typeof payload === 'object' && 'data' in payload
                ? payload.data
                : payload;

            if (Array.isArray(direcionamento)) {
                return direcionamento[0] || null;
            }

            return direcionamento || null;
        },
    });
};

export const useGetEstoqueCorteLista = (
    filtros?: IFiltrosEstoqueCorte,
    options?: IUseEstoqueCorteOptions,
) => {
    return useQuery({
        queryKey: ['estoqueCorte', filtros],
        enabled: options?.enabled ?? true,
        queryFn: async () => {
            const params = new URLSearchParams();

            if (filtros?.produtoId) params.append('produtoId', filtros.produtoId);
            if (filtros?.loteProducaoId) params.append('loteProducaoId', filtros.loteProducaoId);
            if (filtros?.tamanhoId) params.append('tamanhoId', filtros.tamanhoId);
            if (filtros?.corId) params.append('corId', filtros.corId);
            if (filtros?.page) params.append('page', String(filtros.page));
            if (filtros?.limit) params.append('limit', String(filtros.limit));

            if (!filtros?.limit) params.append('limit', '1000');

            const queryString = params.toString();

            try {
                const { data } = await apiClient.get<{ data: EstoqueCorte[]; pagination: PaginatedResponse }>(
                    `/estoque-corte${queryString ? `?${queryString}` : ''}`,
                );

                return data.data;
            } catch (error: any) {
                const mensagem = error.response?.data?.details?.[0]?.mensage ||
                    error.response?.data?.error;
                toast.error(mensagem);
                return [];
            }
        },
    });
};


export const usePostCriarDirecionamentoRemessa = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dados: DirecionamentoRequestBodyPayload) => {
            const { data } = await apiClient.post<{ data: DirecionamentoRemessa[], pagination: PaginatedResponse }>('/direcionamentos', dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['direcionamentos'] });
            queryClient.invalidateQueries({ queryKey: ['lotes-producao'] });
            toast.success('Direcionamento criado com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);
        },
    });
};




export const useDeletarDirecionamento = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/direcionamentos/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['direcionamentos'] });
            toast.success('Direcionamento deletado com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);
        },
    });
};

export const usePutDirecionamento = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, dados }: { id: string; dados: DirecionamentoPutRequestBodyPayload }) => {
            const { data } = await apiClient.put<{ data: DirecionamentoRemessa[]; pagination: PaginatedResponse }>(
                `/direcionamentos/${id}`,
                dados,
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['direcionamentos'] });
            queryClient.invalidateQueries({ queryKey: ['lotes-producao'] });
            toast.success('Direcionamento atualizado com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error;
            toast.error(mensagem);
        },
    });
};

export const usePutDirecionamentoStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, dados }: { id: string; dados: DirecionamentoPutStatusRequestBodyPayload }) => {
            const { data } = await apiClient.put<{ data: DirecionamentoRemessa[]; pagination: PaginatedResponse }>(
                `/direcionamentos/${id}/status`,
                dados,
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['direcionamentos'] });
            queryClient.invalidateQueries({ queryKey: ['lotes-producao'] });
            toast.success('Status do direcionamento atualizado com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error;
            toast.error(mensagem);
        },
    });
};

export const usePutDirecionamentoSkuPrice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, dados }: { id: string; dados: DirecionamentoPutSkuPriceRequestBodyPayload }) => {
            const { data } = await apiClient.put<{ data: DirecionamentoRemessa[]; pagination: PaginatedResponse }>(
                `/direcionamentos/${id}/skuPrice`,
                dados,
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['direcionamentos'] });
            toast.success('Preco da faccao por SKU atualizado com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error;
            toast.error(mensagem);
        },
    });
};

export const usePutDirecionamentoItens = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, dados }: { id: string; dados: DirecionamentoPutItensRequestBodyPayload }) => {
            const { data } = await apiClient.put<DirecionamentoRemessa | { data: DirecionamentoRemessa }>(
                `/direcionamentos/${id}/itens`,
                dados,
            );

            if (data && typeof data === 'object' && 'data' in data) {
                return data.data;
            }

            return data as DirecionamentoRemessa;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['direcionamentos'] });
            queryClient.invalidateQueries({ queryKey: ['lotes-producao'] });
            toast.success('Itens da remessa atualizados com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error;
            toast.error(mensagem);
        },
    });
};