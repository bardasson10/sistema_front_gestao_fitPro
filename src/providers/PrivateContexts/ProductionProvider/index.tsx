'use client';
import { useContext, useState, ReactNode } from 'react';
import { ProductionContext } from '@/contexts/ProductionContext';

import {
  Colaborador,
  Fornecedor,
  Faccao,
  Tecido,
  RoloTecido,
  LoteProducao,
  Conferencia,
  MovimentacaoEstoque,
} from '@/types/production';

import { 
  sampleColaboradores, 
  sampleFaccoes, 
  sampleFornecedores, 
  sampleLotes, 
  sampleRolos, 
  sampleTecidos 
} from '@/app/Samples/production-sample';

export function ProductionProvider({ children }: { children: ReactNode }) {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(sampleColaboradores);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(sampleFornecedores);
  const [faccoes, setFaccoes] = useState<Faccao[]>(sampleFaccoes);
  const [tecidos, setTecidos] = useState<Tecido[]>(sampleTecidos);
  const [rolos, setRolos] = useState<RoloTecido[]>(sampleRolos);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [lotes, setLotes] = useState<LoteProducao[]>(sampleLotes);
  const [conferencias, setConferencias] = useState<Conferencia[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const generateId = () => crypto.randomUUID();

  function createActions<T extends { id: string; criadoEm?: Date }>(
  setState: React.Dispatch<React.SetStateAction<T[]>>
) {
  return {
    
    add: async (item: Omit<T, 'id' | 'criadoEm'>) => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      setState(prev => [
        ...prev, 
        { ...item, id: generateId(), criadoEm: new Date() } as T 
      ]);
      setIsLoading(false);
    },

    update: async (id: string, item: Partial<T>) => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => prev.map(i => i.id === id ? { ...i, ...item } : i));
      setIsLoading(false);
    },

    remove: async (id: string) => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => prev.filter(i => i.id !== id));
      setIsLoading(false);
    }
  };
}

  const colaboradorActions = createActions(setColaboradores);
  const fornecedorActions = createActions(setFornecedores);
  const faccaoActions = createActions(setFaccoes);
  const tecidoActions = createActions(setTecidos);
  const roloActions = createActions(setRolos);
  const loteActions = createActions(setLotes);
  const movimentacaoActions = createActions(setMovimentacoes);
  const conferenciaActions = createActions(setConferencias);

  return (
    <ProductionContext.Provider value={{
      isLoading,
      setIsLoading,
      colaboradores,
      addColaborador: colaboradorActions.add,
      updateColaborador: colaboradorActions.update,
      removeColaborador: colaboradorActions.remove,

      fornecedores,
      addFornecedor: fornecedorActions.add,
      updateFornecedor: fornecedorActions.update,
      removeFornecedor: fornecedorActions.remove,

      faccoes,
      addFaccao: faccaoActions.add,
      updateFaccao: faccaoActions.update,
      removeFaccao: faccaoActions.remove,

      tecidos,
      addTecido: tecidoActions.add,
      updateTecido: tecidoActions.update,
      removeTecido: tecidoActions.remove,

      rolos,
      addRolo: roloActions.add,
      updateRolo: roloActions.update,
      removeRolo: roloActions.remove,

      movimentacoes,
      addMovimentacao: movimentacaoActions.add,
      updateMovimentacao: movimentacaoActions.update,
      removeMovimentacao: movimentacaoActions.remove,
    
      lotes,
      addLote: loteActions.add,
      updateLote: loteActions.update,
      removeLote: loteActions.remove,

      conferencias,
      addConferencia: conferenciaActions.add,
      updateConferencia: conferenciaActions.update,
      removeConferencia: conferenciaActions.remove,
    }}>
      {children}
    </ProductionContext.Provider>
  );
}

export function useProduction() {
  const context = useContext(ProductionContext);
  if (context === undefined) {
    throw new Error('useProduction must be used within a ProductionProvider');
  }
  return context;
}
