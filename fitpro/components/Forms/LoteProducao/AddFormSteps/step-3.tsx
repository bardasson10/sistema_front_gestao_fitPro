import { useFieldArray, useFormContext } from "react-hook-form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { LoteProducaoTableGrade } from "@/components/DataTable/Tables/LoteProducao/grade/table";

export const LoteProducaoAddStep3 = () => {
  const { control } = useFormContext<LoteProducaoFormValues>();

  const { fields } = useFieldArray({
    control,
    name: "grade",
  });


  return (
    <div className="space-y-4 ">
      <div>
        <LoteProducaoTableGrade
          grade={fields} 
          isLoading={false}
          viewOnRemove={true} 
        />
      </div>

    </div>
  )
};