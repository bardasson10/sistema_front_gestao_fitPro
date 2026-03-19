import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import { toast } from 'sonner';
import { PaginatedResponse } from '@/types/production';
import { Faccao, FaccaoRequestBodyPayload } from '@/types/Faccao';


export const useGetFaccoes = (status?: 'ativo' | 'inativo') => {
    return useSuspenseQuery({
        queryKey: ['faccoes', status],
        queryFn: async () => {
            const queryString = status ? `?status=${status}` : '';
            const response = await apiClient.get<{ data: Faccao[], pagination: PaginatedResponse }>(`/faccoes${queryString}`);
            return response.data.data;
        },
    });
};

export const useGetFaccao = (id: string) => {
    return useSuspenseQuery({
        queryKey: ['faccoes', id],
        queryFn: async () => {
            const { data } = await apiClient.get<Faccao>(`/faccoes/${id}`);
            return data;
        },
    });
};

export const usePostCriarFaccao = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dados: FaccaoRequestBodyPayload ) => {
            const { data } = await apiClient.post<Faccao>('/faccoes', dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['faccoes'] });
            toast.success('Facção criada com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);
        },
    });
};

export const usePutFaccao = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, dados }: { id: string; dados: FaccaoRequestBodyPayload }) => {
            const { data } = await apiClient.put<Faccao>(`/faccoes/${id}`, dados);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['faccoes'] });
            queryClient.invalidateQueries({ queryKey: ['faccoes', data.id] });
            toast.success('Facção atualizada com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);
        },
    });
};

export const useDeleteFaccao = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/faccoes/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['faccoes'] });
            toast.success('Facção deletada com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);;
        },
    });
};