import { Badge } from "@/components/ui/badge"
import { parseNumber } from "@/utils/Formatter/parse-number-format";
import { dataFormatter } from "@/utils/Formatter/data-brasil-format";
import { Label } from "@/components/ui/label";
import { ApiLoteProducaoResponse } from "@/hooks/queries/useProducao";
import { formatNumberToBRL } from "@/utils/Formatter/moeda-brasil-format";
import { Textarea } from "@/components/ui/textarea";
import { CircleColorView } from "@/components/ui/circle-color-view";

interface LoteProducaoFormProps {
  lote: ApiLoteProducaoResponse
}

export function LoteProducaoFormInfo({ lote }: LoteProducaoFormProps) {
  return (
    <div className="space-y-6">
      
      {/* Materiais */}
      <div className="pt-2">
        <Label className="mb-3 block text-sm font-semibold">
          Informações dos Materiais
        </Label>

        <div className="space-y-5">
          {lote.materiais?.map((m) => {
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

                  {m.cores?.map((c) => (
                    <div
                      key={c.corId}
                      className="border rounded-lg p-4 bg-card space-y-3"
                    >
                      {/* Cabeçalho da Cor */}
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
                            Valor do Tecido: <span className="font-medium">{formatNumberToBRL(Number(m.valorPorKg))}/kg</span>
                          </p>
                        </div>
                      </div>

                      {/* Rolos da Cor */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Rolos dessa cor
                        </Label>
                        <div className="space-y-2">
                          {c.rolos?.map((r) => (
                            <div key={r.codigoBarraRolo} className="flex justify-between items-center text-xs bg-muted/40 p-2 rounded">
                              <span className="font-medium">{r.codigoBarraRolo}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Peso:</span>
                                <span className="font-medium">{parseNumber(r.pesoReservado)}kg</span>
                                <span className="text-muted-foreground">|</span>
                                <span className="text-muted-foreground">Valor:</span>
                                <span className="font-medium text-primary">{formatNumberToBRL(Number(m.valorPorKg) * Number(r.pesoReservado))}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Grade da Cor */}
                     
                      
                    </div>
                  ))}
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