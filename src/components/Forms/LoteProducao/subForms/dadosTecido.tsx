import { useEffect, useMemo, useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CircleColorView } from "@/components/ui/circle-color-view";
import { useEstoqueTecidos } from "@/hooks/queries/useEstoque";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useProducaoActions } from "@/hooks/use-Producao-actions";
import { Spinner } from "@/components/ui/spinner";
import { formatNumberToBRL } from "@/utils/Formatter/moeda-brasil-format";
import { parseNumber } from "@/utils/Formatter/parse-number-format";
import { EstoqueRolo } from "@/types/EstoqueRolo";


type RoloFormValue = {
  estoqueRoloId: string;
  pesoReservado: number;
  info?: EstoqueRolo;
  tecidoId?: string;
  tecidoNome?: string;
  corNome?: string;
  corHex?: string;
  codigoBarraRolo?: string;
  valorPorKg?: number;
  pesoDisponivelKg?: number;
};

type ResumoPorTecido = {
  tecidoId: string;
  tecidoNome: string;
  qtdRolos: number;
  pesoTotal: number;
  valorTotal: number;
  cores: string[];
};

interface DadosTecidoProps {
  form: UseFormReturn<LoteProducaoFormValues>;
}

export const DadosTecido = ({ form }: DadosTecidoProps) => {
  const { data: roloTecidoData } = useEstoqueTecidos();
  const rolosTecido = roloTecidoData || [];
  const materiaisDoLote = useWatch({
    control: form.control,
    name: "materiais",
  }) || [];

  const { handleAdicionarRolos, isSubmitting } = useProducaoActions();

  const [rolosSelecionados, setRolosSelecionados] = useState<RoloFormValue[]>([]);

  const rolosExistentes = useMemo<RoloFormValue[]>(() => {
    return materiaisDoLote.flatMap((material) =>
      (material.cores || []).flatMap((cor) =>
        (cor.rolos || []).map((rolo) => {
          const info = rolosTecido.find((r) => r.id === rolo.id);

          return {
            estoqueRoloId: rolo.id,
            pesoReservado: parseNumber(rolo.pesoReservado),
            info,
            tecidoId: material.tecidoId,
            tecidoNome: material.nome,
            corNome: cor.nome,
            corHex: cor.codigoHex,
            codigoBarraRolo: rolo.codigoBarraRolo,
            valorPorKg: parseNumber(material.valorPorKg),
            pesoDisponivelKg: parseNumber(rolo.pesoAtualKg),
          };
        })
      )
    );
  }, [materiaisDoLote, rolosTecido]);

  // Se um rolo virar "existente" apos salvar/refetch, remove da lista de "novos".
  useEffect(() => {
    setRolosSelecionados((prev) => {
      const next = prev.filter(
        (roloNovo) =>
          !rolosExistentes.some(
            (roloExistente) => roloExistente.estoqueRoloId === roloNovo.estoqueRoloId
          )
      );

      if (next.length === prev.length) {
        return prev;
      }

      return next;
    });
  }, [rolosExistentes]);

  const formatKg = (value: number) =>
    parseNumber(value).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getValorPorKg = (rolo: RoloFormValue): number => {
    const valorDoEstoque = parseNumber(rolo.info?.tecido.valorPorKg);
    if (valorDoEstoque > 0) return valorDoEstoque;
    return parseNumber(rolo.valorPorKg);
  };

  const getCodigoBarra = (rolo: RoloFormValue): string => {
    return rolo.info?.codigoBarraRolo || rolo.codigoBarraRolo || rolo.estoqueRoloId;
  };

  const getNomeTecido = (rolo: RoloFormValue): string => {
    return rolo.info?.tecido.nome || rolo.tecidoNome || "Tecido";
  };

  const getCorHex = (rolo: RoloFormValue): string | undefined => {
    return rolo.info?.tecido.cor?.codigoHex || rolo.corHex;
  };

  const getCorNome = (rolo: RoloFormValue): string => {
    return rolo.info?.tecido.cor?.nome || rolo.corNome || "Sem cor";
  };

  const getPesoDisponivel = (rolo: RoloFormValue): number => {
    const pesoDoEstoque = parseNumber(rolo.info?.pesoAtualKg);
    if (pesoDoEstoque > 0) return pesoDoEstoque;
    return parseNumber(rolo.pesoDisponivelKg);
  };

  const buildRoloFromEstoque = (roloInfo: EstoqueRolo, pesoReservado: number): RoloFormValue => ({
    estoqueRoloId: roloInfo.id,
    pesoReservado: parseNumber(pesoReservado),
    info: roloInfo,
    tecidoId: roloInfo.tecidoId,
    tecidoNome: roloInfo.tecido.nome,
    corNome: roloInfo.tecido.cor?.nome,
    corHex: roloInfo.tecido.cor?.codigoHex,
    codigoBarraRolo: roloInfo.codigoBarraRolo,
    valorPorKg: parseNumber(roloInfo.tecido.valorPorKg),
    pesoDisponivelKg: parseNumber(roloInfo.pesoAtualKg),
  });

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

      if (!roloInfo) {
        return prev;
      }

      return [...prev, buildRoloFromEstoque(roloInfo, pesoReservado)];
    });
  };

  const removeRolo = (id: string) => {
    setRolosSelecionados((prev) => prev.filter((rolo) => rolo.estoqueRoloId !== id));
  };

  // Calcula o valor total do lote (rolos existentes + novos)
  const calcularValorRolo = (rolo: RoloFormValue): number => {
    const peso = parseNumber(rolo.pesoReservado);
    const valorPorKg = getValorPorKg(rolo);
    if (!peso || !valorPorKg) return 0;
    return peso * valorPorKg;
  };

  const valorTotalRolosExistentes = rolosExistentes.reduce((acc, rolo) => acc + calcularValorRolo(rolo), 0);
  const valorTotalRolosNovos = rolosSelecionados.reduce((acc, rolo) => acc + calcularValorRolo(rolo), 0);
  const valorTotalLote = valorTotalRolosExistentes + valorTotalRolosNovos;

  const resumoPorTecido = useMemo<ResumoPorTecido[]>(() => {
    const rolosCompletos = [...rolosExistentes, ...rolosSelecionados];
    const agrupado = new Map<string, { tecidoNome: string; qtdRolos: number; pesoTotal: number; valorTotal: number; cores: Set<string> }>();

    rolosCompletos.forEach((rolo) => {
      const tecidoId = rolo.info?.tecido.id || rolo.tecidoId || "sem-tecido";
      const tecidoNome = getNomeTecido(rolo);
      const corNome = getCorNome(rolo);
      const pesoReservado = parseNumber(rolo.pesoReservado);
      const valorRolo = calcularValorRolo(rolo);

      const atual = agrupado.get(tecidoId);

      if (!atual) {
        agrupado.set(tecidoId, {
          tecidoNome,
          qtdRolos: 1,
          pesoTotal: pesoReservado,
          valorTotal: valorRolo,
          cores: new Set([corNome]),
        });
        return;
      }

      atual.qtdRolos += 1;
      atual.pesoTotal += pesoReservado;
      atual.valorTotal += valorRolo;
      atual.cores.add(corNome);
    });

    return Array.from(agrupado.entries()).map(([tecidoId, values]) => ({
      tecidoId,
      tecidoNome: values.tecidoNome,
      qtdRolos: values.qtdRolos,
      pesoTotal: values.pesoTotal,
      valorTotal: values.valorTotal,
      cores: Array.from(values.cores),
    }));
  }, [rolosExistentes, rolosSelecionados]);

  const rolosPayload = rolosSelecionados.map((rolo) => ({
    estoqueRoloId: rolo.estoqueRoloId,
    pesoReservado: parseNumber(rolo.pesoReservado),
  }));


  return (
    <div className="space-y-6">

      <Select onValueChange={(id) => {
        const roloInfo = rolosTecido.find(rol => rol.id === id);
        if (roloInfo) {
          addRolo(id, parseNumber(roloInfo.pesoAtualKg));
        }
      }}>
        <SelectTrigger className="w-full border-dashed border-2">
          <SelectValue placeholder="🔍 Clique para buscar e adicionar rolos..." />
        </SelectTrigger>
        <SelectContent>
          {rolosTecido.filter((rol) => parseNumber(rol.pesoAtualKg) > 0).map((rol) => {
            const isInExistentes = rolosExistentes.some((rolo) => rolo.estoqueRoloId === rol.id);
            const isInNovosSelecionados = rolosSelecionados.some((rolo) => rolo.estoqueRoloId === rol.id);
            const isDisabled = isInExistentes || isInNovosSelecionados;

            return (
              <SelectItem key={rol.id} value={rol.id} disabled={isDisabled}>
                <div className="flex items-center gap-2">
                  <CircleColorView color={rol.tecido.cor?.codigoHex} />
                  <span>{rol.codigoBarraRolo} - {rol.tecido.nome} ({formatKg(parseNumber(rol.pesoAtualKg))}kg disponivel)</span>
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
                  <p className="text-sm font-semibold">{getCodigoBarra(item)} - {getNomeTecido(item)}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CircleColorView color={getCorHex(item)} />
                    <span>Cor: {getCorNome(item)}</span>
                    <span>|</span>
                    <span>Peso: {formatKg(getPesoDisponivel(item))}kg</span>
                  </div>
                  <div className="text-xs font-medium text-foreground">
                    Valor: {formatNumberToBRL(getValorPorKg(item))}/kg x {formatKg(parseNumber(item.pesoReservado))}kg = <span className="text-primary font-bold">{formatNumberToBRL(calcularValorRolo(item))}</span>
                  </div>
                </div>

                <div className="w-32 space-y-1">
                  <Label className="text-[10px] uppercase">Peso p/ Lote</Label>
                  <Input
                    type="number"
                    size={1}
                    className="h-8"
                    placeholder="0.00"
                    value={parseNumber(item.pesoReservado) || ''}
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
                  <p className="text-sm font-semibold">{getCodigoBarra(item)} - {getNomeTecido(item)}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CircleColorView color={getCorHex(item)} />
                    <span>Cor: {getCorNome(item)}</span>
                    <span>|</span>
                    <span>Peso: {formatKg(getPesoDisponivel(item))}kg</span>
                  </div>
                  <div className="text-xs font-medium text-foreground">
                    Valor: {formatNumberToBRL(getValorPorKg(item))}/kg x {formatKg(parseNumber(item.pesoReservado))}kg = <span className="text-primary font-bold">{formatNumberToBRL(calcularValorRolo(item))}</span>
                  </div>
                </div>

                <div className="w-32 space-y-1">
                  <Label className="text-[10px] uppercase">Peso p/ Lote</Label>
                  <Input
                    type="number"
                    size={1}
                    className="h-8"
                    placeholder="0.00"
                    value={parseNumber(item.pesoReservado) || ''}
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
            <span className="font-medium">{formatNumberToBRL(valorTotalRolosExistentes)}</span>
          </div>
          {rolosSelecionados.length > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Valor Novos Rolos:</span>
              <span className="font-medium">{formatNumberToBRL(valorTotalRolosNovos)}</span>
            </div>
          )}
          <div className="border-t border-primary/10 pt-2 flex justify-between items-center">
            <span className="font-semibold text-foreground">Valor Total do Lote:</span>
            <span className="text-lg font-bold text-primary">{formatNumberToBRL(valorTotalLote)}</span>
          </div>
        </div>
      )}

      {resumoPorTecido.length > 0 && (
        <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
          <h4 className="text-sm font-medium">Agrupamento por Tecido</h4>
          {resumoPorTecido.map((grupo) => (
            <div key={grupo.tecidoId} className="flex items-center justify-between rounded-md border bg-card p-3">
              <div>
                <p className="text-sm font-semibold">{grupo.tecidoNome}</p>
                <p className="text-xs text-muted-foreground">
                  {grupo.qtdRolos} rolo(s) | {formatKg(grupo.pesoTotal)}kg | Cores: {grupo.cores.join(", ")}
                </p>
              </div>
              <p className="text-sm font-semibold text-primary">{formatNumberToBRL(grupo.valorTotal)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="w-full justify-content-end flex">

        <Button
          onClick={() => handleAdicionarRolos(form.getValues('id'), { rolosProducao: rolosPayload })}
          disabled={isSubmitting || rolosPayload.length === 0}
        >
          {isSubmitting ? <Spinner /> : 'Salvar Tecidos'}
        </Button>
      </div>


    </div>
  );
};