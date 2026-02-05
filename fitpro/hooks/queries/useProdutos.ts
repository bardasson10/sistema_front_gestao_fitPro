import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import { toast } from 'sonner';

// ============ TIPOS ============

interface TipoProduto {
  id: string;
  nome: string;
  produtos: any[];
  tamanhos: any[];
  createdAt: string;
}

interface Tamanho {
  id: string;
  nome: string;
  ordem: number;
  createdAt: string;
}

interface Produto {
  id: string;
  tipoProdutoId: string;
  nome: string;
  sku: string;
  fabricante: string;
  custoMedioPeca: number;
  precoMedioVenda: number;
  tipo: TipoProduto;
  lotes: any[];
  createdAt: string;
}

// ============ TIPOS DE PRODUTO ============

export const useTiposProduto = () => {
  return useQuery({
    queryKey: ['tipos-produto'],
    queryFn: async () => {
      const { data } = await apiClient.get<TipoProduto[]>('/tipos-produto');
      return data;
    },
  });
};

export const useTipoProduto = (id: string) => {
  return useQuery({
    queryKey: ['tipos-produto', id],
    queryFn: async () => {
      const { data } = await apiClient.get<TipoProduto>(`/tipos-produto/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCriarTipoProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nome: string) => {
      const { data } = await apiClient.post<TipoProduto>('/tipos-produto', { nome });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-produto'] });
      toast.success('Tipo de produto criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar tipo de produto');
    },
  });
};

export const useAtualizarTipoProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, nome }: { id: string; nome: string }) => {
      const { data } = await apiClient.put<TipoProduto>(`/tipos-produto/${id}`, { nome });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tipos-produto'] });
      queryClient.invalidateQueries({ queryKey: ['tipos-produto', data.id] });
      toast.success('Tipo de produto atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar tipo de produto');
    },
  });
};

export const useDeletarTipoProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/tipos-produto/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-produto'] });
      toast.success('Tipo de produto deletado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao deletar tipo de produto');
    },
  });
};

// ============ TAMANHOS ============

export const useTamanhos = () => {
  return useQuery({
    queryKey: ['tamanhos'],
    queryFn: async () => {
      const { data } = await apiClient.get<Tamanho[]>('/tamanhos');
      return data;
    },
  });
};

export const useTamanho = (id: string) => {
  return useQuery({
    queryKey: ['tamanhos', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Tamanho>(`/tamanhos/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCriarTamanho = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados: { nome: string; ordem: number }) => {
      const { data } = await apiClient.post<Tamanho>('/tamanhos', dados);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tamanhos'] });
      toast.success('Tamanho criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar tamanho');
    },
  });
};

export const useAtualizarTamanho = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...dados }: { id: string; nome: string; ordem: number }) => {
      const { data } = await apiClient.put<Tamanho>(`/tamanhos/${id}`, dados);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tamanhos'] });
      queryClient.invalidateQueries({ queryKey: ['tamanhos', data.id] });
      toast.success('Tamanho atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar tamanho');
    },
  });
};

export const useDeletarTamanho = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/tamanhos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tamanhos'] });
      toast.success('Tamanho deletado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao deletar tamanho');
    },
  });
};

// ============ PRODUTOS ============

export const useProdutos = (tipoProdutoId?: string) => {
  return useQuery({
    queryKey: ['produtos', tipoProdutoId],
    queryFn: async () => {
      const params = tipoProdutoId ? `?tipoProdutoId=${tipoProdutoId}` : '';
      const { data } = await apiClient.get<Produto[]>(`/produtos${params}`);
      return data;
    },
  });
};

export const useProduto = (id: string) => {
  return useQuery({
    queryKey: ['produtos', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Produto>(`/produtos/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCriarProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados: {
      tipoProdutoId: string;
      nome: string;
      sku: string;
      fabricante: string;
      custoMedioPeca: number;
      precoMedioVenda: number;
    }) => {
      const { data } = await apiClient.post<Produto>('/produtos', dados);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['produtos', data.tipoProdutoId] });
      toast.success('Produto criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar produto');
    },
  });
};

export const useAtualizarProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...dados }: any) => {
      const { data } = await apiClient.put<Produto>(`/produtos/${id}`, dados);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['produtos', data.id] });
      toast.success('Produto atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar produto');
    },
  });
};

export const useDeletarProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/produtos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast.success('Produto deletado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao deletar produto');
    },
  });
};

// ============ ASSOCIAÇÕES TIPO PRODUTO - TAMANHO ============

export const useTamanhosPorTipo = (tipoProdutoId: string) => {
  return useQuery({
    queryKey: ['tipos-produto', tipoProdutoId, 'tamanhos'],
    queryFn: async () => {
      const { data } = await apiClient.get<Tamanho[]>(
        `/tipos-produto/${tipoProdutoId}/tamanhos`
      );
      return data;
    },
    enabled: !!tipoProdutoId,
  });
};

export const useAssociarTamanhoTipo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados: { tipoProdutoId: string; tamanhoId: string }) => {
      const { data } = await apiClient.post('/tipos-produto-tamanho', dados);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tipos-produto', variables.tipoProdutoId, 'tamanhos'],
      });
      toast.success('Tamanho associado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao associar tamanho');
    },
  });
};

export const useDeletarAssociacaoTamanhoTipo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/tipos-produto-tamanho/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-produto'] });
      toast.success('Associação removida com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover associação');
    },
  });
};
