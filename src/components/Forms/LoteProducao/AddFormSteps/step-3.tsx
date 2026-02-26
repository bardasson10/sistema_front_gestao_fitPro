import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { CircleColorView } from "@/components/ui/circle-color-view";
import { useMemo } from "react";

type Cor = {
  id: string;
  nome: string;
  codigoHex: string;
};

type CorOption = Cor & {
  optionValue: string;
};

interface Step3Props {
  corAtivaId: string | null;
  setCorAtivaId: (id: string) => void;
}

export const LoteProducaoAddStep3 = ({ corAtivaId, setCorAtivaId }: Step3Props) => {
  const { control, watch } = useFormContext<LoteProducaoFormValues>();

  const materiaisRaw = watch("materiais");
  const materiais = Array.isArray(materiaisRaw) ? materiaisRaw : [];

  const corDosRolosLote = useMemo<CorOption[]>(() => {
    const coresFlat = materiais.flatMap((material) => material.cores || []);
    const uniqueByCorId = new Map<string, CorOption>();

    coresFlat.forEach((cor, index) => {
      const corId = cor.id || `sem-id-${index}`;

      if (!uniqueByCorId.has(corId)) {
        uniqueByCorId.set(corId, {
          id: corId,
          nome: cor.nome || "Sem cor",
          codigoHex: cor.codigoHex || "",
          optionValue: corId,
        });
      }
    });

    console.log("Cores únicas para o Select:", Array.from(coresFlat));

    return Array.from(uniqueByCorId.values());
  }, [materiais]);


  const qtdRolosEnfestos = materiais.flatMap((m) =>
    (m.cores || []).map((c) => Number(c.rolos?.length || 0))
  );


  return (
    <div className="space-y-4 w-full flex flex-col">
      <FormField
        control={control}
        name="materiais"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cores</FormLabel>
            <FormControl>
              <Select
                onValueChange={(val) => setCorAtivaId(val)}
                value={corAtivaId || ""}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma cor" />
                </SelectTrigger>
                <SelectContent>
                  {corDosRolosLote.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Nenhum cor disponível
                    </div>
                  ) : (
                    corDosRolosLote.map((cor) => (
                      <SelectItem key={cor.optionValue} value={cor.optionValue}>
                        {cor.nome} - <CircleColorView color={cor.codigoHex} height={18} width={18} />
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormItem>
        <FormLabel>Qtd de Rolos p/ Cor</FormLabel>
        <Input
          value={qtdRolosEnfestos.join(", ")}
          type="number"
          min={0}
          readOnly
          disabled={true}
        />
      </FormItem>

      <FormField
        control={control}
        name="materiais"
        render={({ field }) => (
          <FormItem >
            <FormLabel>Qtd de Folhas p/ cor</FormLabel>
            <Input
              value={(
                Array.isArray(field.value)
                  ? field.value.flatMap((m) => (m.cores || []).flatMap((c) => c.qtdFolhas ?? 0))
                  : []
              ).join(", ")}
              type="number"
              min={0}
              readOnly
              placeholder="Digite a quantidade de folhas"
            />
            <FormControl>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

    </div>
  );
};
