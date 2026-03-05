import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CircleColorView } from "@/components/ui/circle-color-view";
import { EstoqueRolo, useEstoqueTecidos } from "@/hooks/queries/useEstoque";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useProducaoActions } from "@/hooks/use-Producao-actions";
import { Spinner } from "@/components/ui/spinner";
import { formatNumberToBRL } from "@/utils/Formatter/moeda-brasil-format";


type RoloFormValue = {
  estoqueRoloId: string;
  pesoReservado: number;
  info?: EstoqueRolo;
};

interface DadosTecidoProps {
  form: UseFormReturn<LoteProducaoFormValues>;
}

export const DadosTecido = ({ form }: DadosTecidoProps) => {
  const { data: roloTecidoData } = useEstoqueTecidos();
  const rolosTecido = roloTecidoData || [];

  const { handleAdicionarRolos, isSubmitting } = useProducaoActions();

  const [rolosExistentes, setRolosExistentes] = useState<RoloFormValue[]>([]);
  const [rolosSelecionados, setRolosSelecionados] = useState<RoloFormValue[]>([]);

  // Sincroniza rolos existentes do lote com dados de estoque apenas quando estoque carrega
  useEffect(() => {
    const materiaisDoLote = form.getValues("materiais") || [];

    const rolosDoLote = materiaisDoLote.flatMap((material) =>
      (material.cores || []).flatMap((cor) =>
        (cor.rolos || []).map((rolo) => ({
          estoqueRoloId: rolo.id,
          pesoReservado: rolo.pesoReservado,
          info: rolosTecido.find((r) => r.id === rolo.id),
        }))
      )
    );

    // Verifica se os dados realmente mudaram antes de atualizar
    setRolosExistentes((prev) => {
      const hasChanged = JSON.stringify(prev) !== JSON.stringify(rolosDoLote);
      return hasChanged ? rolosDoLote : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolosTecido.length]);

  const addRolo = (id: string, pesoReservado: number) => {
    setRolosSelecionados((prev) => {
      // Verifica se já existe nos rolos novos
      if (prev.some((rolo) => rolo.estoqueRoloId === id)) {
        return prev;
      }

      // Verifica se já existe nos rolos antigos
      if (rolosExistentes.some((rolo) => rolo.estoqueRoloId === id)) {
        return prev;
      }

      const roloInfo = rolosTecido.find((rolo) => rolo.id === id);
      return [...prev, { estoqueRoloId: id, pesoReservado, info: roloInfo }];
    });
  };

  const removeRolo = (id: string) => {
    setRolosSelecionados((prev) => prev.filter((rolo) => rolo.estoqueRoloId !== id));
  };

  // Calcula o valor total do lote (rolos existentes + novos)
  const calcularValorRolo = (rolo: RoloFormValue): number => {
    if (!rolo.pesoReservado || !rolo.info?.tecido.valorPorKg) return 0;
    return Number(rolo.pesoReservado) * Number(rolo.info.tecido.valorPorKg);
  };

  const valorTotalRolosExistentes = rolosExistentes.reduce((acc, rolo) => acc + calcularValorRolo(rolo), 0);
  const valorTotalRolosNovos = rolosSelecionados.reduce((acc, rolo) => acc + calcularValorRolo(rolo), 0);
  const valorTotalLote = valorTotalRolosExistentes + valorTotalRolosNovos;


  return (
    <div className="space-y-6">

      <Select onValueChange={(id) => {
        const roloInfo = rolosTecido.find(rol => rol.id === id);
        if (roloInfo) {
          addRolo(id, Number(roloInfo.pesoAtualKg));
        }
      }}>
        <SelectTrigger className="w-full border-dashed border-2">
          <SelectValue placeholder="🔍 Clique para buscar e adicionar rolos..." />
        </SelectTrigger>
        <SelectContent>
          {rolosTecido.filter((rol) => Number(rol.pesoAtualKg) > 0).map((rol) => {
            const isInExistentes = rolosExistentes.some((rolo) => rolo.estoqueRoloId === rol.id);
            const isInNovosSelecionados = rolosSelecionados.some((rolo) => rolo.estoqueRoloId === rol.id);
            const isDisabled = isInExistentes || isInNovosSelecionados;

            return (
              <SelectItem key={rol.id} value={rol.id} disabled={isDisabled}>
                <div className="flex items-center gap-2">
                  <CircleColorView color={rol.tecido.cor?.codigoHex} />
                  <span>{rol.codigoBarraRolo} - {rol.tecido.nome} ({rol.pesoAtualKg}kg disponível)</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* ROLOS EXISTENTES */}
      {rolosExistentes.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Rolos Existentes</h4>
          <div className="grid gap-3 opacity-75">
            {rolosExistentes.map((item) => (
              <div key={item.estoqueRoloId} className="flex items-end gap-4 p-3 border rounded-lg bg-card shadow-sm opacity-60">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold">{item.info?.codigoBarraRolo} - {item.info?.tecido.nome}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CircleColorView color={item.info?.tecido.cor?.codigoHex} />
                    <span>Peso: {item.info?.pesoAtualKg}kg</span>
                  </div>
                  <div className="text-xs font-medium text-foreground">
                    Valor: R$ {Number(item.info?.tecido.valorPorKg).toFixed(2)}/kg × {Number(item.pesoReservado).toFixed(2)}kg = <span className="text-primary font-bold">R$ {calcularValorRolo(item).toFixed(2)}</span>
                  </div>
                </div>

                <div className="w-32 space-y-1">
                  <Label className="text-[10px] uppercase">Peso p/ Lote</Label>
                  <Input
                    type="number"
                    size={1}
                    className="h-8"
                    placeholder="0.00"
                    value={item.pesoReservado || ''}
                    disabled={true}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROLOS NOVOS ADICIONADOS */}
      {rolosSelecionados.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Novos Rolos</h4>
          <div className="grid gap-3">
            {rolosSelecionados.map((item) => (
              <div key={item.estoqueRoloId} className="flex items-end gap-4 p-3 border rounded-lg bg-card shadow-sm animate-in fade-in-50">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold">{item.info?.codigoBarraRolo} - {item.info?.tecido.nome}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CircleColorView color={item.info?.tecido.cor?.codigoHex} />
                    <span>Peso: {item.info?.pesoAtualKg}kg</span>
                  </div>
                  <div className="text-xs font-medium text-foreground">
                    Valor: R$ {Number(item.info?.tecido.valorPorKg).toFixed(2)}/kg × {Number(item.pesoReservado).toFixed(2)}kg = <span className="text-primary font-bold">R$ {formatNumberToBRL(calcularValorRolo(item))}</span>
                  </div>
                </div>

                <div className="w-32 space-y-1">
                  <Label className="text-[10px] uppercase">Peso p/ Lote</Label>
                  <Input
                    type="number"
                    size={1}
                    className="h-8"
                    placeholder="0.00"
                    value={item.pesoReservado || ''}
                    disabled={true}
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => removeRolo(item.estoqueRoloId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESUMO DO VALOR TOTAL */}
      {(rolosExistentes.length > 0 || rolosSelecionados.length > 0) && (
        <div className="space-y-2 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Valor Rolos Existentes:</span>
            <span className="font-medium">R$ {valorTotalRolosExistentes.toFixed(2)}</span>
          </div>
          {rolosSelecionados.length > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Valor Novos Rolos:</span>
              <span className="font-medium">R$ {valorTotalRolosNovos.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-primary/10 pt-2 flex justify-between items-center">
            <span className="font-semibold text-foreground">Valor Total do Lote:</span>
            <span className="text-lg font-bold text-primary">R$ {valorTotalLote.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="w-full justify-content-end flex">

        <Button onClick={() => handleAdicionarRolos(form.getValues('id'), { rolosProducao: rolosSelecionados })} disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : 'Salvar Tecidos'}
        </Button>
      </div>


    </div>
  );
};