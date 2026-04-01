import { parseNumber } from "@/utils/Formatter/parse-number-format";
import { Label } from "@/components/ui/label";
import { ApiLoteProducaoResponse } from "@/hooks/queries/useProducao";
import { formatNumberToBRL } from "@/utils/Formatter/moeda-brasil-format";
import { CircleColorView } from "@/components/ui/circle-color-view";
import { useEstoqueTecidos } from "@/hooks/queries/useEstoque";

interface LoteProducaoFormProps {
  lote: ApiLoteProducaoResponse
}

export function LoteProducaoFormInfo({ lote }: LoteProducaoFormProps) {
  const { data: estoqueRolosData = [] } = useEstoqueTecidos();

  const getValorPorKgRolo = (
    rolo: {
      id: string;
      valorPorKg?: number | string;
      tecido?: {
        valorPorKg?: number | string;
        cor?: { valorTecido?: number | string };
      };
    },
    valorTecidoDaCor?: number | string,
    fallbackValorPorKg = 0
  ) => {
    const valorNoTecidoDaCor = parseNumber(valorTecidoDaCor);
    if (valorNoTecidoDaCor > 0) return valorNoTecidoDaCor;

    const valorNoTecidoDoRolo = parseNumber(rolo.tecido?.cor?.valorTecido);
    if (valorNoTecidoDoRolo > 0) return valorNoTecidoDoRolo;

    const valorNoTecidoBase = parseNumber(rolo.tecido?.valorPorKg);
    if (valorNoTecidoBase > 0) return valorNoTecidoBase;

    const valorNoRolo = parseNumber(rolo.valorPorKg);
    if (valorNoRolo > 0) return valorNoRolo;

    const valorDoEstoque = parseNumber(
      estoqueRolosData.find((estoque) => estoque.id === rolo.id)?.tecido.cor?.valorTecido
    );
    return valorDoEstoque > 0 ? valorDoEstoque : fallbackValorPorKg;
  };

  const formatKg = (peso: number) => {
    return parseNumber(peso).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-6">

      {/* Materiais */}
      <div className="pt-2">
        <Label className="mb-3 block text-sm font-semibold">
          Informações dos Materiais
        </Label>

        <div className="space-y-5">
          {lote.materiais?.map((m) => {
            const valorMaterialFallback = parseNumber(m.valorPorKg);
            const coresUnicas = Array.from(
              new Map(
                (m.cores || []).map((cor) => [
                  cor.corId || cor.nome || cor.codigoHex || "sem-cor",
                  cor,
                ])
              ).values()
            );

            const totalMaterialTecidos = coresUnicas.reduce((accCor, cor) => {
              const rolosDaCor = cor.rolos || [];
              const fallbackCor = parseNumber(cor.valorTecido) > 0
                ? parseNumber(cor.valorTecido)
                : valorMaterialFallback;

              const totalValorCor = rolosDaCor.reduce((accRolo, rolo) => {
                const valorPorKgRolo = getValorPorKgRolo(rolo, cor.valorTecido, fallbackCor);
                return accRolo + valorPorKgRolo * parseNumber(rolo.pesoReservado);
              }, 0);

              return accCor + totalValorCor;
            }, 0);

            return (
              <div
                key={m.tecidoId}
                className="rounded-xl border bg-background shadow-sm p-5 space-y-4"
              >
                {/* Nome do Material */}
                <div className="border-b pb-3 text-center">
                  <h3 className="text-xl font-semibold tracking-tight">
                    {m.nome}
                  </h3>
                  {/* Informações Técnicas do Material */}
                  <div className="bg-muted/30 rounded-md p-4 mt-3">
                    <div className="grid grid-cols-3 gap-6 text-center text-sm">
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">
                          Rendimento
                        </span>
                        <p className="font-medium">
                          {parseNumber(m.rendimentoMetroKg)} m/kg
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">
                          Largura
                        </span>
                        <p className="font-medium">
                          {parseNumber(m.larguraMetros)} m
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">
                          Gramatura
                        </span>
                        <p className="font-medium">
                          {parseNumber(m.gramatura)} g/m²
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cores - Separadas por cor */}
                <div className="space-y-4">
                  <Label className="text-xs text-muted-foreground block">
                    Cores dos rolos de tecido
                  </Label>

                  {m.cores?.map((c) => {
                    const rolosDaCor = c.rolos || [];
                    const valorCorNoPayload = parseNumber(c.valorTecido);
                    const fallbackCor = valorCorNoPayload > 0 ? valorCorNoPayload : valorMaterialFallback;

                    const totalPesoCor = rolosDaCor.reduce(
                      (acc, rolo) => acc + parseNumber(rolo.pesoReservado),
                      0
                    );

                    const totalValorCor = rolosDaCor.reduce((acc, rolo) => {
                      const valorPorKgRolo = getValorPorKgRolo(rolo, c.valorTecido, fallbackCor);
                      return acc + valorPorKgRolo * parseNumber(rolo.pesoReservado);
                    }, 0);

                    const valorCorPorKg = valorCorNoPayload > 0
                      ? valorCorNoPayload
                      : totalPesoCor > 0
                        ? totalValorCor / totalPesoCor
                        : fallbackCor;

                    return (
                      <div
                        key={c.corId}
                        className="border rounded-lg p-4 bg-card space-y-3"
                      >
                        {/* Cabecalho da Cor */}
                        <div className="flex items-center gap-3 border-b pb-3">
                          <CircleColorView
                            color={c.codigoHex}
                            height={24}
                            width={24}
                          />
                          <div>
                            <p className="text-sm font-semibold">
                              {c.nome}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Valor do Tecido: <span className="font-medium">{formatNumberToBRL(valorCorPorKg)}/kg</span>
                            </p>
                          </div>
                        </div>

                        {/* Rolos da Cor */}
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Rolos dessa cor
                          </Label>
                          <div className="space-y-2">
                            {rolosDaCor.map((r) => {
                              const pesoReservado = parseNumber(r.pesoReservado);
                              const valorPorKgRolo = getValorPorKgRolo(r, c.valorTecido, fallbackCor);
                              const valorTotalRolo = valorPorKgRolo * pesoReservado;

                              return (
                                <div key={r.codigoBarraRolo} className="flex justify-between items-center text-xs bg-muted/40 p-2 rounded">
                                  <span className="font-medium">{r.codigoBarraRolo}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Peso:</span>
                                    <span className="font-medium">{formatKg(pesoReservado)}kg</span>
                                    <span className="text-muted-foreground">|</span>
                                    <span className="text-muted-foreground">Valor:</span>
                                    <span className="font-medium text-primary">{formatNumberToBRL(valorTotalRolo)}</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        <div className="flex justify-end border-t pt-2">
                          <p className="text-xs font-semibold text-primary">
                            Total da Cor: {formatNumberToBRL(totalValorCor)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-sm font-semibold">Valor Total dos Tecidos:</span>
                  <span className="text-base font-bold text-primary">{formatNumberToBRL(totalMaterialTecidos)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Observações */}
      {/* <div>
        <Label className="mb-2 block text-sm font-semibold">
          Observações
        </Label>

        <Textarea
          value={lote.observacao || ''}
          readOnly
          className="resize-none h-24 bg-muted/30"
          placeholder="Nenhuma observação para este lote."
        />
      </div> */}

    </div>
  );
}