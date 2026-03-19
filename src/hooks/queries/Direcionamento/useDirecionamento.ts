import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import { toast } from 'sonner';
import { PaginatedResponse } from '@/types/production';
import { DirecionamentoRemessa, DirecionamentoRequestBodyPayload } from '@/types/Direcionamento';



export const useGetDirecionamentos = (filtros?: {
    status?: string;
    faccaoId?: string;
}) => {
    return useSuspenseQuery({
        queryKey: ['direcionamentos', filtros],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filtros?.status) params.append('status', filtros.status);
            if (filtros?.faccaoId) params.append('faccaoId', filtros.faccaoId);

            const queryString = params.toString();
            const { data } = await apiClient.get<{ data: DirecionamentoRemessa[], pagination: PaginatedResponse }>(
                `/direcionamentos${queryString ? `?${queryString}` : ''}`
            );
            return data.data;
        },
    });
};

export const useGetDirecionamento = (id: string) => {
    return useSuspenseQuery({
        queryKey: ['direcionamentos', id],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: DirecionamentoRemessa[], pagination: PaginatedResponse }>(`/direcionamentos/${id}`);
            return data.data;
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


//TODO: Implementar atualização de direcionamento, endpoint ainda não disponível no backend
// export const useAtualizarDirecionamento = () => {
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: async ({ id, ...dados }: {
//             id: string;
//             faccaoId?: string;
//             tipoServico?:
//             | 'costura'
//             | 'estampa'
//             | 'tingimento'
//             | 'acabamento'
//             | 'corte'
//             | 'outro';
//             status?: string;
//             dataSaida?: string;
//             dataPrevisaoRetorno?: string;
//         }) => {
//             const { data } = await apiClient.put<Direcionamento>(
//                 `/direcionamentos/${id}`,
//                 dados
//             );
//             return data;
//         },
//         onSuccess: (data: Direcionamento) => {
//             queryClient.invalidateQueries({ queryKey: ['direcionamentos'] });
//             queryClient.invalidateQueries({ queryKey: ['direcionamentos', data.id] });
//             toast.success('Direcionamento atualizado com sucesso!');
//         },
//         onError: (error: any) => {
//             const mensagem = error.response?.data?.details?.[0]?.mensage ||
//                 error.response?.data?.error
//             toast.error(mensagem);
//         },
//     });
// };

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