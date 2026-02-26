import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { parseNumber } from "@/utils/Formatter/parse-number-format";
import { Checkbox } from "@/components/ui/checkbox";
import { useEstoqueTecidos } from "@/hooks/queries/useEstoque";
import { CircleColorView } from "@/components/ui/circle-color-view";
import { Spinner } from "@/components/ui/spinner";

interface LoteProducaoAddStep2Props {
  isEditing?: boolean;
}

export const LoteProducaoAddStep2 = ({ isEditing }: LoteProducaoAddStep2Props) => {
  const { control, watch } = useFormContext<LoteProducaoFormValues>();

  const materiais = watch("materiais");
  const materiaisArray = Array.isArray(materiais) ? materiais : [];

  const pesoTotalRolos = materiaisArray.reduce((total, material) => {
    return total + Number(material?.pesoTotal || 0);
  }, 0);

  const rolosSelecionados = materiaisArray
    .flatMap((material) => (Array.isArray(material?.cores) ? material.cores : []))
    .flatMap((cor) => (Array.isArray(cor?.rolos) ? cor.rolos : []));



  const roloDisponivel = "disponivel";

  const filtros = isEditing ? undefined : { situacao: roloDisponivel };

  const { data: rolosData, isLoading } = useEstoqueTecidos(filtros);

  const rolos = rolosData || [];

  return (
    <div className="space-y-4 ">
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <span className="text-sm text-muted-foreground">Carregando rolos disponíveis...</span>
          <Spinner className="ml-2" />
        </div>
      ) : (
        <FormField
          control={control}
          name="materiais"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selecione os Rolos de Tecido Disponíveis</FormLabel>
              <FormControl>
                <div className="flex w-full flex-col space-y-3 rounded-md border border-input bg-background p-3 max-h-96 overflow-y-auto">
                  {rolos.length === 0 ? (
                    <span className="text-sm text-muted-foreground">Nenhum rolo disponível</span>
                  ) : (

                    rolos.map((rolo) => {
                      return (
                        <div key={rolo.id} className="flex items-center space-x-3 p-2 hover:bg-accent rounded transition">
                          <Checkbox
                            id={rolo.id}
                            checked={rolosSelecionados.some((roloSelecionado) => roloSelecionado.id === rolo.id)}
                            onCheckedChange={(checked) => {
                              const currentValue = Array.isArray(field.value) ? field.value : [];
                              if (checked) {
                                if (currentValue.some((m) => m.cores.some(c => c.rolos.some(r => r.id === rolo.id)))) {
                                  return;
                                }

                                field.onChange([
                                  ...currentValue,
                                  {
                                    id: rolo.id,
                                    tecidoId: rolo.tecidoId || rolo.tecido?.id || '',
                                    corId: rolo.tecido?.cor?.id || rolo.tecido?.corId || '',
                                    corNome: rolo.tecido?.cor?.nome || '',
                                    codigoBarraRolo: rolo.codigoBarraRolo || '',
                                    pesoInicialKg: Number(rolo.pesoInicialKg ?? rolo.pesoAtualKg ?? 0),
                                    pesoAtualKg: Number(rolo.pesoAtualKg ?? 0),
                                    situacao: rolo.situacao || 'disponivel',
                                    createdAt: rolo.createdAt || '',
                                    updatedAt: rolo.updatedAt || '',
                                    pesoReservado: Number(rolo.pesoAtualKg ?? 0),
                                  }
                                ]);
                              } else {
                                field.onChange(
                                  currentValue.filter(m => !m.cores.some(c => c.rolos.some(r => r.id === rolo.id)))
                                );
                              }
                            }}
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium whitespace-nowrap">
                              {rolo.codigoBarraRolo} -
                            </span>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                {rolo.tecido?.cor?.nome || 'Sem cor'}
                                <CircleColorView color={rolo.tecido?.cor?.codigoHex} width={20} height={20} />
                              </span>
                              <span>-</span>
                              <span>
                                {rolo.tecido?.nome}
                              </span>
                            </div>
                          </div>
                          <span className="text-sm font-medium">
                            {rolo.situacao === 'disponivel' ? parseNumber(rolo.pesoAtualKg || 0) + ' kg' : ""}
                          </span>
                        </div>
                      );

                    })
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      <div>
        <span className="text-lg font-medium">
          Peso total: {pesoTotalRolos} kg
        </span>
      </div>
    </div>
  )
};