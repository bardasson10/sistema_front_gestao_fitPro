import { LoteProducao } from "@/hooks/queries/useProducao";
import { Colaborador, GradeProduto } from "../production";


export interface LoteProducaoProps {
  lotesProducao: LoteProducao[];
  isLoading: boolean;
  onView: (item: LoteProducao) => void;
}

export interface LoteProducaoGradeProps {
  grade: GradeProduto[];
  isLoading: boolean;
  viewOnRemove?: boolean;
}