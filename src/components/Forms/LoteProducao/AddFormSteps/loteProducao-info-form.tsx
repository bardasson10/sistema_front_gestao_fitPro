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

      {/* Header */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="block text-xs text-muted-foreground">
            Data de Criação
          </Label>
          <span className="text-sm font-medium">
            {lote.createdAt ? dataFormatter(lote.createdAt) : '-'}
          </span>
        </div>

        <div>
          <Label className="block text-xs text-muted-foreground text-center mb-1">
            Status
          </Label>
          <Badge className="w-fit h-8 font-medium px-4 flex items-center justify-center mx-auto" variant={
            lote.status === 'concluido' ? 
            'secondary' : lote.status === 'em_andamento' ? 
            'outline' : lote.status === 'cancelado' ? 
            'destructive' : 'default'}>

            {lote.status || 'Planejado'}
          </Badge>
        </div>
      </div>

      {/* Responsável */}
      <div>
        <Label className="block text-xs text-muted-foreground">
          Lote criado por
        </Label>
        <span className="text-sm font-semibold">
          {lote.responsavel?.nome?.toUpperCase() || '-'}
        </span>
      </div>

      {/* Materiais */}
      <div className="pt-2">
        <Label className="mb-3 block text-sm font-semibold">
          Informações dos Materiais
        </Label>

        <div className="space-y-5">
          {lote.materiais?.map((m) => {

            const peso = Number(m.pesoTotal) || 0;
            const valorKg = Number(m.valorPorKg) || 0;
            const totalMaterial = peso * valorKg;

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
                </div>

                {/* Cores */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground text-center w-full block">
                    Cores dos rolos de tecido
                  </Label>

                  <div className="flex flex-wrap justify-center gap-6">
                    {m.cores?.map((c) => (
                      <div
                        key={c.corId}
                        className="flex flex-col items-center gap-1"
                      >
                        <span className="text-sm font-medium">
                          {c.nome}
                        </span>

                        <div className="flex items-center gap-2">
                          <CircleColorView
                            color={c.codigoHex}
                            height={18}
                            width={18}
                          />
                          <span className="text-xs text-muted-foreground">
                            {c.rolos?.map(r => r.codigoBarraRolo).join(", ")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informações Técnicas */}
                <div className="bg-muted/30 rounded-md p-4">
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

                {/* Valores */}
                <div className="grid grid-cols-2 gap-6 text-center text-sm">
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground">
                      Valor do Kg
                    </span>
                    <p className="font-medium">
                      {formatNumberToBRL(parseNumber(valorKg))}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground">
                      Peso Total Kg
                    </span>
                    <p className="font-medium">
                      {parseNumber(peso)} kg
                    </p>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-muted/50 rounded-lg px-4 py-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Total do Material
                    </span>

                    <span className="text-lg font-bold text-primary tracking-tight">
                      {formatNumberToBRL(totalMaterial)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Observações */}
      <div>
        <Label className="mb-2 block text-sm font-semibold">
          Observações
        </Label>

        <Textarea
          value={lote.observacao || ''}
          readOnly
          className="resize-none h-24 bg-muted/30"
          placeholder="Nenhuma observação para este lote."
        />
      </div>

    </div>
  );
}