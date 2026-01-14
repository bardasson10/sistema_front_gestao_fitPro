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

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Colaboradores
  const addColaborador = (colaborador: Omit<Colaborador, 'id' | 'criadoEm'>) => {
    setColaboradores(prev => [...prev, { ...colaborador, id: generateId(), criadoEm: new Date() }]);
  };

  const updateColaborador = (id: string, colaborador: Partial<Colaborador>) => {
    setColaboradores(prev => prev.map(c => c.id === id ? { ...c, ...colaborador } : c));
  };

  // Fornecedores
  const addFornecedor = (fornecedor: Omit<Fornecedor, 'id' | 'criadoEm'>) => {
    setFornecedores(prev => [...prev, { ...fornecedor, id: generateId(), criadoEm: new Date() }]);
  };

  const updateFornecedor = (id: string, fornecedor: Partial<Fornecedor>) => {
    setFornecedores(prev => prev.map(f => f.id === id ? { ...f, ...fornecedor } : f));
  };

  // Facções
  const addFaccao = (faccao: Omit<Faccao, 'id' | 'criadoEm'>) => {
    setFaccoes(prev => [...prev, { ...faccao, id: generateId(), criadoEm: new Date() }]);
  };

  const updateFaccao = (id: string, faccao: Partial<Faccao>) => {
    setFaccoes(prev => prev.map(f => f.id === id ? { ...f, ...faccao } : f));
  };

  // Tecidos
  const addTecido = (tecido: Omit<Tecido, 'id' | 'criadoEm'>) => {
    setTecidos(prev => [...prev, { ...tecido, id: generateId(), criadoEm: new Date() }]);
  };

  const updateTecido = (id: string, tecido: Partial<Tecido>) => {
    setTecidos(prev => prev.map(t => t.id === id ? { ...t, ...tecido } : t));
  };

  // Rolos
  const addRolo = (rolo: Omit<RoloTecido, 'id' | 'criadoEm'>) => {
    setRolos(prev => [...prev, { ...rolo, id: generateId(), criadoEm: new Date() }]);
  };

  const updateRolo = (id: string, rolo: Partial<RoloTecido>) => {
    setRolos(prev => prev.map(r => r.id === id ? { ...r, ...rolo } : r));
  };

  // Movimentações
  const addMovimentacao = (mov: Omit<MovimentacaoEstoque, 'id'>) => {
    setMovimentacoes(prev => [...prev, { ...mov, id: generateId() }]);
  };

  // Lotes
  const addLote = (lote: Omit<LoteProducao, 'id'>) => {
    setLotes(prev => [...prev, { ...lote, id: generateId() }]);
  };

  const updateLote = (id: string, lote: Partial<LoteProducao>) => {
    setLotes(prev => prev.map(l => l.id === id ? { ...l, ...lote } : l));
  };

  // Conferências
  const addConferencia = (conferencia: Omit<Conferencia, 'id'>) => {
    setConferencias(prev => [...prev, { ...conferencia, id: generateId() }]);
  };

  const updateConferencia = (id: string, conferencia: Partial<Conferencia>) => {
    setConferencias(prev => prev.map(c => c.id === id ? { ...c, ...conferencia } : c));
  };

  return (
    <ProductionContext.Provider value={{
      colaboradores,
      addColaborador,
      updateColaborador,
      fornecedores,
      addFornecedor,
      updateFornecedor,
      faccoes,
      addFaccao,
      updateFaccao,
      tecidos,
      addTecido,
      updateTecido,
      rolos,
      addRolo,
      updateRolo,
      movimentacoes,
      addMovimentacao,
      lotes,
      addLote,
      updateLote,
      conferencias,
      addConferencia,
      updateConferencia,
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
