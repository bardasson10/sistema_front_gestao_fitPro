import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
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

export interface IFiltrosLote {
    status: string;
    responsavelId: string;
    corId: string;
    produtoId: string;
    codigoLote: string;
    dataInicio: string;
    dataFim: string;
    page: number;
    limit: number;
}



export const useGetListAllLotes = (filtros?: Partial<IFiltrosLote>) => {
    return useSuspenseQuery({
        queryKey: ['lotes-producao', 'list-all' , filtros],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: ILoteResponse[]; pagination: PaginatedResponse }>(
                `/lotes-producao`
                , 
                {
                    params:  filtros 
                }
            );
            return data.data
        },
    });
};

export const useGetResumoPorCor = (filtros?: Partial<IFiltrosLote>) => {
    return useSuspenseQuery({
        queryKey: ['lotes-producao', 'resumo-por-cor', filtros],
        queryFn: async () => {
            const emptyResumo: IResumoPorCorResponse = {
                totalGeral: {
                    produtos: [],
                    tamanhos: [],
                    grandTotal: 0,
                },
                cores: [],
            };

            const { data } = await apiClient.get<{ data?: IResumoPorCorResponse; pagination?: PaginatedResponse } | IResumoPorCorResponse>(
                `/lotes-producao/resumo-por-cor`,
                {
                    params: filtros,
                }
            );

            // Aceita os dois formatos de resposta: direto ou envelopado em { data: ... }.
            if (data && typeof data === 'object' && 'totalGeral' in data && 'cores' in data) {
                return data as IResumoPorCorResponse;
            }

            if (data && typeof data === 'object' && 'data' in data && data.data) {
                return data.data;
            }

            return emptyResumo;
        },
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
