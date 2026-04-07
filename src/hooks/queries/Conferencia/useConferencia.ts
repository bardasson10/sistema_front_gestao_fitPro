import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import { toast } from 'sonner';
import { PaginatedResponse } from '@/types/production';
import { Conferencia, ConferenciaRequestBodyPayload, ConferenciaStatusQualidade, ConferenciaUpdateRequestBodyPayload } from '@/types/Conferencia';


export const useGetListAllConferencias = (filtros?: {
    statusQualidade?: ConferenciaStatusQualidade;
    liberadoPagamento?: boolean;
}) => {
    return useSuspenseQuery({
        queryKey: ['conferencias', filtros],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filtros?.statusQualidade) params.append('statusQualidade', filtros.statusQualidade);
            if (filtros?.liberadoPagamento !== undefined)
                params.append('liberadoPagamento', String(filtros.liberadoPagamento));

            const queryString = params.toString();
            const { data } = await apiClient.get<{data:Conferencia[], pagination: PaginatedResponse }>(
                `/conferencias${queryString ? `?${queryString}` : ''}`
            );

            return data.data;
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