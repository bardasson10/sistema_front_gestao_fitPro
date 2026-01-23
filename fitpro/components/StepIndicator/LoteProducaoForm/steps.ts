import { LoteProducaoAddStep1 } from "@/components/Forms/LoteProducao/AddFormSteps/step-1";
import { LoteProducaoAddStep2 } from "@/components/Forms/LoteProducao/AddFormSteps/step-2";
import { LoteProducaoAddStep3 } from "@/components/Forms/LoteProducao/AddFormSteps/step-3";
import  { JSX } from "react";


type Step = {
  id: number;
  title: string;
  component: (props?: any) => JSX.Element | null;
};

const STEPS: Step[] = [
  { id: 1, title: "1", component: LoteProducaoAddStep1 },
  { id: 2, title: "2", component: LoteProducaoAddStep2 },
  { id: 3, title: "3", component: LoteProducaoAddStep3 },
];

export default STEPS;