
export interface Faccao {
    id: string;
    nome: string;
    responsavel: string;
    contato: string;
    prazoMedioDias: number; 
    prazoMedio?: number;
    status: 'ativo' | 'inativo' | '';
    createdAt: string;
    updatedAt?: string;
    direcionamentos?: string[]; 
}


export interface FaccaoRequestBodyPayload {
    nome: string;
    responsavel: string;
    contato: string;
    prazoMedioDias: number; 
    status: 'ativo' | 'inativo' ;
}

export type ServiceFaccao = 'Costura' | 'Corte';
export const ServicesValues: ServiceFaccao[] = ['Costura', 'Corte'] as const;


