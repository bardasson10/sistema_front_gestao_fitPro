import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import { toast } from 'sonner';

// ============ TIPOS ============

interface Fornecedor {
    id: string;
    nome: string;
    tipo: 'tecido' | 'aviamento' | 'servico' | '';
    contato: string;
    createdAt: string;
}

interface Cor {
    id: string;
    nome: string;
    codigoHex: string;
    createdAt: string;
}

interface Tecido {
    id: string;
    fornecedorId: string;
    corId: string;
    nome: string;
    codigoReferencia: string;
    rendimentoMetroKg: number;
    larguraMetros: number;
    valorPorKg: number;
    gramatura: number;
    fornecedor: Fornecedor;
    cor: Cor;
    rolos: any[];
    lotes: any[];
    createdAt: string;
}

// ============ FORNECEDORES ============

export const useFornecedores = () => {
    return useQuery({
        queryKey: ['fornecedores'],
        queryFn: async () => {
            const response = await apiClient.get<{ data: Fornecedor[], pagination: any }>('/fornecedores');
            return response.data.data;
        },
    });
};

export const useFornecedor = (id: string) => {
    return useQuery({
        queryKey: ['fornecedores', id],
        queryFn: async () => {
            const response = await apiClient.get<{ data: Fornecedor }>(`/fornecedores/${id}`);
            return response.data.data;
        },
        enabled: !!id,
    });
};

export const useCriarFornecedor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dados: { nome: string; tipo: string; contato: string }) => {
            const response = await apiClient.post<{ data: Fornecedor }>('/fornecedores', dados);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
            toast.success('Fornecedor criado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao criar fornecedor');
        },
    });
};

export const useAtualizarFornecedor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...dados }: any) => {
            const response = await apiClient.put<{ data: Fornecedor }>(`/fornecedores/${id}`, dados);
            return response.data.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
            queryClient.invalidateQueries({ queryKey: ['fornecedores', data.id] });
            toast.success('Fornecedor atualizado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao atualizar fornecedor');
        },
    });
};

export const useDeletarFornecedor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/fornecedores/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
            toast.success('Fornecedor deletado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao deletar fornecedor');
        },
    });
};

// ============ CORES ============

export const useCores = () => {
    return useQuery({
        queryKey: ['cores'],
        queryFn: async () => {
            const { data } = await apiClient.get<Cor[]>('/cores');
            return data;
        },
    });
};

export const useCor = (id: string) => {
    return useQuery({
        queryKey: ['cores', id],
        queryFn: async () => {
            const { data } = await apiClient.get<Cor>(`/cores/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useCriarCor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dados: { nome: string; codigoHex: string }) => {
            const { data } = await apiClient.post<Cor>('/cores', dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cores'] });
            toast.success('Cor criada com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao criar cor');
        },
    });
};

export const useAtualizarCor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...dados }: any) => {
            const { data } = await apiClient.put<Cor>(`/cores/${id}`, dados);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['cores'] });
            queryClient.invalidateQueries({ queryKey: ['cores', data.id] });
            toast.success('Cor atualizada com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao atualizar cor');
        },
    });
};

export const useDeletarCor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/cores/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cores'] });
            toast.success('Cor deletada com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao deletar cor');
        },
    });
};

// ============ TECIDOS ============

export const useTecidos = (filtros?: { fornecedorId?: string; corId?: string }) => {
    return useQuery({
        queryKey: ['tecidos', filtros],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filtros?.fornecedorId) params.append('fornecedorId', filtros.fornecedorId);
            if (filtros?.corId) params.append('corId', filtros.corId);

            const queryString = params.toString();
            const { data } = await apiClient.get<Tecido[]>(
                `/tecidos${queryString ? `?${queryString}` : ''}`
            );
            return data;
        },
    });
};

export const useTecido = (id: string) => {
    return useQuery({
        queryKey: ['tecidos', id],
        queryFn: async () => {
            const { data } = await apiClient.get<Tecido>(`/tecidos/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useCriarTecido = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dados: {
            fornecedorId: string;
            corId: string;
            nome: string;
            codigoReferencia: string;
            rendimentoMetroKg: number;
            larguraMetros: number;
            valorPorKg: number;
            gramatura: number;
        }) => {
            const { data } = await apiClient.post<Tecido>('/tecidos', dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tecidos'] });
            toast.success('Tecido criado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao criar tecido');
        },
    });
};

export const useAtualizarTecido = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...dados }: any) => {
            const { data } = await apiClient.put<Tecido>(`/tecidos/${id}`, dados);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['tecidos'] });
            queryClient.invalidateQueries({ queryKey: ['tecidos', data.id] });
            toast.success('Tecido atualizado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao atualizar tecido');
        },
    });
};

export const useDeletarTecido = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/tecidos/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tecidos'] });
            toast.success('Tecido deletado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao deletar tecido');
        },
    });
};
