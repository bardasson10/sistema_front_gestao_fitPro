import { BaseCard } from "@/components/MobileViewCards/base-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dataFormatter } from "@/utils/Formatter/data-brasil-format";
import { Send } from "lucide-react";

export interface LoteProntoDirecionamentoItem {
  loteId: string;
  loteCodigo: string;
  totalPecas: number;
  totalProdutos: number;
  dataCriacao?: string;
}

interface LotesProntosDirecionamentoSectionProps {
  itens: LoteProntoDirecionamentoItem[];
  onDirecionar: (item: LoteProntoDirecionamentoItem) => void;
}

export function LotesProntosDirecionamentoSection({
  itens,
  onDirecionar,
}: LotesProntosDirecionamentoSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Send className="h-5 w-5 text-muted-foreground" />
          Lotes Prontos para Direcionamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left p-3 font-semibold text-muted-foreground">Lote</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Produtos</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Quantidade</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Criado em</th>
                <th className="text-left p-3 font-semibold text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {itens.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-muted-foreground">
                    Nenhum lote pronto para direcionamento
                  </td>
                </tr>
              ) : (
                itens.map((item) => (
                  <tr key={item.loteId} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <span className="font-mono font-semibold">{item.loteCodigo}</span>
                    </td>
                    <td className="p-3">{item.totalProdutos}</td>
                    <td className="p-3">{item.totalPecas} peças</td>
                    <td className="p-3">
                      {item.dataCriacao ? dataFormatter(new Date(item.dataCriacao)) : '-'}
                    </td>
                    <td className="p-3">
                      <Button size="sm" onClick={() => onDirecionar(item)}>
                        <Send className="h-4 w-4 mr-2" /> Direcionar
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
              Nenhum lote pronto para direcionamento
            </p>
          ) : (
            itens.map((item) => (
              <BaseCard
                key={item.loteId}
                title={`Lote ${item.loteCodigo}`}
                cardClassName="min-h-fit"
                headerClassName="pb-2"
                content={
                  <div className="grid gap-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Produtos:</span>
                      <span className="font-medium">{item.totalProdutos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantidade:</span>
                      <span className="font-medium">{item.totalPecas} peças</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Criado em:</span>
                      <span className="font-medium">
                        {item.dataCriacao ? dataFormatter(new Date(item.dataCriacao)) : '-'}
                      </span>
                    </div>
  
                  </div>
                }
                footer={
                  <Button className="w-full" onClick={() => onDirecionar(item)}>
                    <Send className="h-4 w-4 mr-2" /> Direcionar
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