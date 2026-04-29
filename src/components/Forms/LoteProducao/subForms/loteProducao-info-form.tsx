import { useMemo } from "react";
import { parseNumber } from "@/utils/Formatter/parse-number-format";
import { Label } from "@/components/ui/label";
import { ApiLoteProducaoResponse } from "@/hooks/queries/useProducao";
import { formatNumberToBRL } from "@/utils/Formatter/moeda-brasil-format";
import { CircleColorView } from "@/components/ui/circle-color-view";
import { useEstoqueTecidos } from "@/hooks/queries/useEstoque";

interface LoteProducaoFormProps {
  lote: ApiLoteProducaoResponse;
}

export function LoteProducaoFormInfo({ lote }: LoteProducaoFormProps) {
  const { data: estoqueRolosData = [] } = useEstoqueTecidos();

  // Formatação de KG
  const formatKg = (peso: number) => {
    return parseNumber(peso).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Normalizador para unificar tecidos com o mesmo nome
  const normalizeTextKey = (value?: string): string => {
    return (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, " ");
  };

  // Busca do valor correto do Kg
  const getValorPorKgRolo = (
    rolo: any,
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
      estoqueRolosData.find((estoque: any) => estoque.id === rolo.id)?.tecido?.cor?.valorTecido
    );
    return valorDoEstoque > 0 ? valorDoEstoque : fallbackValorPorKg;
  };

  // Motor de Agrupamento
  const resumoAgrupado = useMemo(() => {
    const materiais = lote.materiais || [];
    const agrupado = new Map();

    materiais.forEach((mat) => {
      const nomeTecido = (mat.nome || "Tecido Desconhecido").trim();
      const keyTecido = normalizeTextKey(nomeTecido) || mat.tecidoId || "SEM-TECIDO";
      
      const valorMaterialFallback = parseNumber(mat.valorPorKg);

      if (!agrupado.has(keyTecido)) {
        agrupado.set(keyTecido, {
          nome: nomeTecido,
          rendimento: parseNumber(mat.rendimentoMetroKg),
          largura: parseNumber(mat.larguraMetros),
          gramatura: parseNumber(mat.gramatura),
          cores: new Map(),
          totalTecido: 0,
        });
      }

      const grupoTecido = agrupado.get(keyTecido);

      if (!grupoTecido.rendimento && mat.rendimentoMetroKg) grupoTecido.rendimento = parseNumber(mat.rendimentoMetroKg);
      if (!grupoTecido.largura && mat.larguraMetros) grupoTecido.largura = parseNumber(mat.larguraMetros);
      if (!grupoTecido.gramatura && mat.gramatura) grupoTecido.gramatura = parseNumber(mat.gramatura);

      const coresMat = mat.cores || [];

      coresMat.forEach((c) => {
        const nomeCor = (c.nome || "Sem Cor").trim();
        const keyCor = normalizeTextKey(nomeCor);
        
        const valorCorNoPayload = parseNumber(c.valorTecido);
        const fallbackCor = valorCorNoPayload > 0 ? valorCorNoPayload : valorMaterialFallback;

        if (!grupoTecido.cores.has(keyCor)) {
          grupoTecido.cores.set(keyCor, {
            nome: nomeCor,
            hex: c.codigoHex,
            valorKg: fallbackCor,
            rolos: [],
            totalCor: 0,
            pesoCor: 0
          });
        }

        const grupoCor = grupoTecido.cores.get(keyCor);
        const rolosCor = c.rolos || [];

        rolosCor.forEach((r) => {
          const pesoReservado = parseNumber(r.pesoReservado);
          const valorPorKgRolo = getValorPorKgRolo(r, c.valorTecido, fallbackCor);
          const valorTotalRolo = valorPorKgRolo * pesoReservado;

          grupoCor.rolos.push({
            id: r.id,
            codigo: r.codigoBarraRolo || "Sem Código",
            peso: pesoReservado,
            valor: valorTotalRolo,
          });

          // Se a cor ainda precisa definir o valor/kg baseado no primeiro rolo caso não tenha payload
          if (grupoCor.valorKg === 0 && valorPorKgRolo > 0) {
              grupoCor.valorKg = valorPorKgRolo;
          }

          grupoCor.totalCor += valorTotalRolo;
          grupoCor.pesoCor += pesoReservado;
          grupoTecido.totalTecido += valorTotalRolo;
        });
      });
    });

    return Array.from(agrupado.values()).map((tec) => ({
      ...tec,
      cores: Array.from(tec.cores.values()),
    }));
  }, [lote.materiais, estoqueRolosData]);

  // Calcula o valor total de todos os tecidos somados do Lote
  const valorTotalLote = resumoAgrupado.reduce((acc, tec) => acc + tec.totalTecido, 0);

  if (!lote.materiais || lote.materiais.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground border rounded-lg bg-muted/20">
        Nenhum material adicionado a este lote.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="pt-2">
        <Label className="mb-3 block text-sm font-semibold">
          Informações dos Materiais
        </Label>

        <div className="space-y-5">
          {resumoAgrupado.map((tecido) => (
            <div
              key={tecido.nome}
              className="rounded-xl border bg-background shadow-sm p-5 space-y-4"
            >
              {/* Nome e Specs do Material */}
              <div className="border-b pb-3 text-center">
                <h3 className="text-xl font-semibold tracking-tight">
                  {tecido.nome}
                </h3>
                <div className="bg-muted/30 rounded-md p-4 mt-3">
                  <div className="grid grid-cols-3 gap-6 text-center text-sm">
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">
                        Rendimento
                      </span>
                      <p className="font-medium">
                        {formatKg(tecido.rendimento)} m/kg
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">
                        Largura
                      </span>
                      <p className="font-medium">
                        {formatKg(tecido.largura)} m
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">
                        Gramatura
                      </span>
                      <p className="font-medium">
                        {formatKg(tecido.gramatura)} g/m²
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

                {tecido.cores.map((cor: any) => (
                  <div
                    key={cor.nome}
                    className="border rounded-lg p-4 bg-card space-y-3"
                  >
                    {/* Cabecalho da Cor */}
                    <div className="flex items-center gap-3 border-b pb-3">
                      <CircleColorView
                        color={cor.hex}
                        height={24}
                        width={24}
                      />
                      <div>
                        <p className="text-sm font-semibold">
                          {cor.nome}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Valor do Tecido: <span className="font-medium">{formatNumberToBRL(cor.valorKg)}/kg</span>
                        </p>
                      </div>
                    </div>

                    {/* Rolos da Cor */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Rolos dessa cor
                      </Label>
                      <div className="space-y-2">
                        {cor.rolos.map((rolo: any) => (
                          <div key={rolo.id} className="flex justify-between items-center text-xs bg-muted/40 p-2 rounded">
                            <span className="font-medium">{rolo.codigo}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Peso Disp:</span>
                              <span className="font-medium">{formatKg(rolo.peso)}kg</span>
                              <span className="text-muted-foreground">|</span>
                              <span className="text-muted-foreground">Valor:</span>
                              <span className="font-medium text-primary">{formatNumberToBRL(rolo.valor)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Subtotal da Cor */}
                    <div className="flex justify-end border-t pt-2">
                      <p className="text-xs font-semibold text-primary">
                        Total da Cor: {formatNumberToBRL(cor.totalCor)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal do Tecido */}
              <div className="border-t pt-3 flex justify-between items-center bg-muted/10 p-3 rounded-md mt-2">
                <span className="text-sm font-semibold">Total do Tecido ({tecido.nome}):</span>
                <span className="text-base font-bold text-primary">{formatNumberToBRL(tecido.totalTecido)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOTAL GERAL */}
      {resumoAgrupado.length > 0 && (
        <div className="p-5 bg-primary/10 border-2 border-primary/30 rounded-lg flex justify-between items-center mt-6 shadow-sm">
          <span className="font-bold text-xl text-foreground">Valor Total dos Tecidos:</span>
          <span className="text-3xl font-black text-primary">{formatNumberToBRL(valorTotalLote)}</span>
        </div>
      )}

    </div>
  );
}