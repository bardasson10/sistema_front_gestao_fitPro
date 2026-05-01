'use client';

import { useMemo, useState } from 'react';
import { Eye, History } from 'lucide-react';
import { Conferencia } from '@/types/Conferencia';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusQualidadeBadge } from './statusBagde-conferencia';
import { dataFormatter } from '@/utils/Formatter/data-brasil-format';
import { ConferenciaDetalhesModal } from './conferencia-detalhes-modal';

interface ConferenciasExternasCardProps {
  conferencias: Conferencia[];
}

const isConferenciaExterna = (conferencia: Conferencia) => conferencia.isProducaoInterna === false;
const statusFinalizadosExternos: Conferencia['statusQualidade'][] = ['aprovado', 'aprovado_defeito'];

export function ConferenciasExternasCard({ conferencias }: ConferenciasExternasCardProps) {
  const [selectedConferencia, setSelectedConferencia] = useState<Conferencia | null>(null);

  const conferenciasExternas = useMemo(() => {
    return (conferencias || [])
      .filter(isConferenciaExterna)
      .filter((conferencia) => statusFinalizadosExternos.includes(conferencia.statusQualidade))
      .sort((a, b) => new Date(b.dataConferencia).getTime() - new Date(a.dataConferencia).getTime());
  }, [conferencias]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          Histórico de Conferências Externas
        </CardTitle>
        <CardDescription>
          Listagem externa finalizada sem informações de pagamento ou preço por SKU
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Qualidade</TableHead>
                <TableHead className="text-right">Recebido/Enviado</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conferenciasExternas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-16 text-center text-muted-foreground">
                    Nenhuma conferência externa finalizada encontrada
                  </TableCell>
                </TableRow>
              ) : (
                conferenciasExternas.map((conferencia) => {
                  const totalEnviado = conferencia.items.reduce((acc, item) => acc + item.quantidadeEnviada, 0);
                  const totalRecebido = conferencia.items.reduce((acc, item) => acc + item.qtdRecebida, 0);

                  return (
                    <TableRow key={conferencia.id}>
                      <TableCell className="font-medium capitalize">
                        {conferencia.direcionamento.tipoServico || '-'}
                      </TableCell>
                      <TableCell>{conferencia.responsavel.nome || '-'}</TableCell>
                      <TableCell>
                        <StatusQualidadeBadge status={conferencia.statusQualidade} />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {totalRecebido}/{totalEnviado}
                      </TableCell>
                      <TableCell>{dataFormatter(conferencia.dataConferencia)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedConferencia(conferencia)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <ConferenciaDetalhesModal
        conferencia={selectedConferencia}
        open={!!selectedConferencia}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedConferencia(null);
          }
        }}
      />
    </Card>
  );
}
