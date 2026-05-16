import { ApiLoteProducaoResponse } from "@/hooks/queries/useProducao";
import {  GradeProduto } from "../production";


export interface LoteProducaoProps {
  lotesProducao: ApiLoteProducaoResponse[];
  isLoading: boolean;
  onView: (item: ApiLoteProducaoResponse) => void;
  onRemove: (id: string) => void;
  onPrint: (item: ApiLoteProducaoResponse) => void;
}

export interface LoteProducaoGradeProps {
  grade: GradeProduto[];
  isLoading: boolean;
  viewOnRemove?: boolean;
}