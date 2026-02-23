import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { BaseCard } from "@/components/MobileViewCards/base-card";
import { dataFormatter } from "@/utils/Formatter/data-brasil-format";
import { ClipboardCheck, Factory, Home } from "lucide-react";

export interface ConferenciaPendenteItem {
  direcionamentoId: string;
  loteId: string;
  loteCodigo: string;
  tipoProducao: "interna" | "faccao";
  faccaoNome?: string;
  quantidadeEsperada: number;
  dataSaida: string;
  prazoMedio: number;
  isAtrasado: boolean;
}

interface PendenciasConferenciaSectionProps<T extends ConferenciaPendenteItem> {
  itens: T[];
  onConferir: (item: T) => void;
}

export function PendenciasConferenciaSection<T extends ConferenciaPendenteItem>({
  itens,
  onConferir,
}: PendenciasConferenciaSectionProps<T>) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
          Produções Aguardando Conferência
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left p-3 font-semibold text-muted-foreground">Lote</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Origem</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Produtos Esperados</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Saída</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Prazo Médio</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-left p-3 font-semibold text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {itens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground">
                    Nenhuma produção aguardando conferência
                  </td>
                </tr>
              ) : (
                itens.map((item) => (
                  <tr key={item.direcionamentoId} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <span className="font-mono font-semibold">{item.loteCodigo}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {item.tipoProducao === "faccao" ? (
                          <>
                            <Factory className="h-4 w-4 text-muted-foreground" />
                            <span>{item.faccaoNome || "Facção"}</span>
                          </>
                        ) : (
                          <>
                            <Home className="h-4 w-4 text-muted-foreground" />
                            <span>Interna</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-3">{item.quantidadeEsperada} peças</td>
                    <td className="p-3">{dataFormatter(new Date(item.dataSaida))}</td>
                    <td className="p-3">{item.prazoMedio} dias</td>
                    <td className="p-3">
                      <StatusBadge status={item.isAtrasado ? "danger" : "warning"}>
                        {item.isAtrasado ? "Atrasado" : "Aguardando"}
                      </StatusBadge>
                    </td>
                    <td className="p-3">
                      <Button size="sm" onClick={() => onConferir(item)}>
                        <ClipboardCheck className="h-4 w-4 mr-2" />
                        Conferir
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="block space-y-3 md:hidden">
          {itens.length === 0 ? (
            <p className="text-center p-4 text-sm text-muted-foreground">
              Nenhuma produção aguardando conferência
            </p>
          ) : (
            itens.map((item) => (
              <BaseCard
                key={item.direcionamentoId}
                title={`Lote ${item.loteCodigo}`}
                cardClassName="min-h-fit"
                headerClassName="pb-2"
                action={
                  <StatusBadge status={item.isAtrasado ? "danger" : "warning"}>
                    {item.isAtrasado ? "Atrasado" : "Aguardando"}
                  </StatusBadge>
                }
                content={
                  <div className="grid gap-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Origem:</span>
                      <span className="font-medium">
                        {item.tipoProducao === "faccao" ? item.faccaoNome || "Facção" : "Interna"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Esperado:</span>
                      <span className="font-medium">{item.quantidadeEsperada} peças</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Saída:</span>
                      <span className="font-medium">{dataFormatter(new Date(item.dataSaida))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prazo:</span>
                      <span className="font-medium">{item.prazoMedio} dias</span>
                    </div>
                  </div>
                }
                footer={
                  <Button className="w-full" onClick={() => onConferir(item)}>
                    <ClipboardCheck className="h-4 w-4 mr-2" /> Conferir
                  </Button>
                }
                footerClassName="border-t 0 bg-muted/50 px-4 py-4"
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}