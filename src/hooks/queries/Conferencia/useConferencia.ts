import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import { toast } from 'sonner';
import { PaginatedResponse } from '@/types/production';
import { Conferencia, ConferenciaRequestBodyPayload, ConferenciaStatusQualidade, ConferenciaUpdateRequestBodyPayload } from '@/types/Conferencia';

export interface IFiltrosConferencia {
    statusQualidade?: ConferenciaStatusQualidade;
    liberadoPagamento?: boolean;
    isProducaoInterna?: boolean;
    direcionamentoId?: string;
    faccaoId?: string;
    responsavelId?: string;
    dataInicio?: string;
    dataFim?: string;
    page?: number;
    limit?: number;
}

export const useGetListAllConferencias = (filtros?: IFiltrosConferencia) => {
    return useSuspenseQuery({
        queryKey: ['conferencias', filtros],
        queryFn: async () => {
            const { data } = await apiClient.get<{data:Conferencia[], pagination: PaginatedResponse }>(
                '/conferencias',
                {
                    params: filtros,
                }
            );

            return {
                data: data.data,
                pagination: data.pagination,
            };
        },
    });
};


export const useGetListAllConferenciasApproved = (filtros?: IFiltrosConferencia) => {
    return useSuspenseQuery({
        queryKey: ['conferencias-aprovadas', filtros],
        queryFn: async () => {
            const { data } = await apiClient.get<{data:Conferencia[], pagination: PaginatedResponse }>(
                '/conferencias/aprovadas',
                {
                    params: filtros,
                }
            );

            return {
                data: data.data,
                pagination: data.pagination,
            };
        },
    });

};


export const useGetByIdConferencia = (id: string) => {
    return useSuspenseQuery({
        queryKey: ['conferencias', id],
        queryFn: async () => {
            const { data } = await apiClient.get<{data:Conferencia[], pagination: PaginatedResponse }>(`/conferencias/${id}`);
            return data.data;
        },
    });
};

export const usePostCriarConferencia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dados: ConferenciaRequestBodyPayload ) => {
            const { data } = await apiClient.post<{data: Conferencia, pagination: PaginatedResponse}>('/conferencias', dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conferencias'] });
            queryClient.invalidateQueries({ queryKey: ['direcionamentos'] });
            toast.success('Conferência criada com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);
        },
    });
};

export const useAtualizarConferencia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, dados }: { id: string; dados: ConferenciaUpdateRequestBodyPayload }) => {
            const { data } = await apiClient.put<{data: Conferencia, pagination: PaginatedResponse}>(`/conferencias/${id}`, dados);
            return data;
        },
        onSuccess: (data) => {
            toast.success('Conferência atualizada com sucesso!'); 
            queryClient.invalidateQueries({ queryKey: ['conferencias'] });
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);
        },
    });
};

export const useDeletarConferencia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/conferencias/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conferencias'] });
            toast.success('Conferência deletada com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);
        },
    });
};