import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import { toast } from 'sonner';
import { PaginatedResponse } from '@/types/production';
import {
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