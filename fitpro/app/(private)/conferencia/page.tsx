'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Direcionamento,
  Conferencia as ConferenciaType,
  LoteProducao,
  ProdutoDirecionado,
} from '@/types/production';
import {
  conferenciaSchema,
  ConferenciaFormValues,
} from '@/schemas/conferencia-schema';
import { ConferenciaForm } from '@/components/Forms/conferencia-form';
import { FormModal } from '@/components/Modal/base-modal-form';
import { Form } from '@/components/ui/form';
import { ClipboardCheck } from 'lucide-react';
import { useFormModal } from '@/hooks/use-form-modal';
import { useProduction } from '@/providers/PrivateContexts/ProductionProvider';
import { toast } from 'sonner';
import { RemoveItemWarning } from '@/components/ErrorManagementComponent/WarnningRemoveItem';
import { PendenciasConferenciaSection } from '@/components/Conferencia/PendenciasConferenciaSection';
import {
  ConferenciaPendenteItem,
} from '@/components/Conferencia/PendenciasConferenciaSection';
import {
  LoteProntoDirecionamentoItem,
  LotesProntosDirecionamentoSection,
} from '@/components/Conferencia/LotesProntosDirecionamentoSection';
import { ConferenciaTable } from '@/components/DataTable/Tables/Conferencia/table';
import { MobileViewConferencia } from '@/components/MobileViewCards/ConferenciaCard';
import { DirecionamentoForm } from '@/components/Forms/direcionamento-form';
import {
  DirecionamentoFormValues,
  direcionamentoSchema,
} from '@/schemas/direcionamento-schema';

const initialValues: ConferenciaFormValues = {
  produtosRecebidos: [],
  avaliacaoQualidade: 'aprovado',
  observacoes: '',
};

export default function Conferencia() {
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Conferência</h1>
        <p className="text-muted-foreground">
          Recebimento e conferência de produção
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Histórico de Conferências</h2>
      </div>

      <div className="hidden md:block">
        
      </div>

      <div className="block md:hidden">
        
      </div>



      
    </div>
  );
}