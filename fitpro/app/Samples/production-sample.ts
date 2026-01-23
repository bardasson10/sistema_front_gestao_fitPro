import {
  Colaborador,
  Fornecedor,
  Faccao,
  Tecido,
  RoloTecido,
  LoteProducao,
} from '@/types/production';

export const sampleColaboradores: Colaborador[] = [
  { id: '1', nome: 'Maria Silva', funcao: 'cortador', status: 'ativo', criadoEm: new Date() },
  { id: '2', nome: 'João Santos', funcao: 'costureira interna', status: 'ativo', criadoEm: new Date() },
  { id: '3', nome: 'Ana Costa', funcao: 'responsavel', status: 'ativo', criadoEm: new Date() },
];

export const sampleFornecedores: Fornecedor[] = [
  { id: '1', nome: 'Têxtil Brasil', tipo: 'tecido', contato: '(11) 99999-0001', criadoEm: new Date() },
  { id: '2', nome: 'Aviamentos São Paulo', tipo: 'aviamento', contato: '(11) 99999-0002', criadoEm: new Date() },
];

export const sampleFaccoes: Faccao[] = [
  { id: '1', nome: 'Facção Alpha', responsavel: 'Carlos Mendes', contato: '(11) 98888-0001', prazoMedio: 7, status: 'ativo', criadoEm: new Date() },
  { id: '2', nome: 'Costura Express', responsavel: 'Fernanda Lima', contato: '(11) 98888-0002', prazoMedio: 5, status: 'ativo', criadoEm: new Date() },
];

export const sampleTecidos: Tecido[] = [
  { id: '1', tipo: 'Suplex', cor: 'Preto', largura: 150, rendimento: 2.5, unidade: 'kg', fornecedorId: '1', criadoEm: new Date() },
  { id: '2', tipo: 'Suplex', cor: 'Branco', largura: 150, rendimento: 2.5, unidade: 'kg', fornecedorId: '1', criadoEm: new Date() },
  { id: '3', tipo: 'Dry Fit', cor: 'Rosa', largura: 160, rendimento: 2.8, unidade: 'kg', fornecedorId: '1', criadoEm: new Date() },
  { id: '4', tipo: 'Cirrê', cor: 'Marrom', largura: 140, rendimento: 2.2, unidade: 'kg', fornecedorId: '2', criadoEm: new Date() },
];

export const sampleRolos: RoloTecido[] = [
  { id: '1', tecidoId: '1', identificacao: 'SPX-001', pesoKg: 15, status: 'disponivel', criadoEm: new Date() },
  { id: '2', tecidoId: '1', identificacao: 'SPX-002', pesoKg: 12, status: 'disponivel', criadoEm: new Date() },
  { id: '3', tecidoId: '2', identificacao: 'SPX-003', pesoKg: 18, status: 'disponivel', criadoEm: new Date() },
  { id: '4', tecidoId: '3', identificacao: 'DRY-001', pesoKg: 10, status: 'reservado', criadoEm: new Date() },
  { id: '5', tecidoId: '4', identificacao: 'CIR-001', pesoKg: 8, status: 'disponivel', criadoEm: new Date() },
];

export const sampleLotes: LoteProducao[] = [
  {
    id: '1',
    codigo: 'LOTE-001',
    dataCreacao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    responsavelId: '3',
    status: 'em_producao',
    tecidosUtilizados: [
      { roloId: '1', tecidoTipo: 'Suplex', cor: 'Preto', pesoKg: 15 },
    ],
    grade: [
      { id: '1', produto: 'legging', gradePP: 10, gradeP: 20, gradeM: 30, gradeG: 20, gradeGG: 10, total: 90 },
      { id: '2', produto: 'top', gradePP: 10, gradeP: 20, gradeM: 30, gradeG: 15, gradeGG: 5, total: 80 },
    ],
    direcionamentos: [
      {
        id: '1',
        loteId: '1',
        tipoProducao: 'faccao',
        faccaoId: '1',
        dataSaida: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        produtos: [{ produto: 'legging', quantidade: 90 }],
        status: 'em_producao',
      },
    ],
  },
  {
    id: '2',
    codigo: 'LOTE-002',
    dataCreacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    responsavelId: '3',
    status: 'cortado',
    tecidosUtilizados: [
      { roloId: '3', tecidoTipo: 'Suplex', cor: 'Branco', pesoKg: 18 },
    ],
    grade: [
      { id: '3', produto: 'short', gradePP: 15, gradeP: 25, gradeM: 35, gradeG: 20, gradeGG: 5, total: 100 },
    ],
    direcionamentos: [],
  },
];
