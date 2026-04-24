'use client';

import { useMemo } from 'react';
import { History } from 'lucide-react';
import { Conferencia } from '@/types/Conferencia';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusQualidadeBadge } from './statusBagde-conferencia';
import { dataFormatter } from '@/utils/Formatter/data-brasil-format';

interface ConferenciasInternasCardProps {
  conferencias: Conferencia[];
}

const isConferenciaInterna = (conferencia: Conferencia) => conferencia.isProducaoInterna === true;

export function ConferenciasInternasCard({ conferencias }: ConferenciasInternasCardProps) {
  const conferenciasInternas = useMemo(() => {
    return (conferencias || [])
      .filter(isConferenciaInterna)
      .sort((a, b) => new Date(b.dataConferencia).getTime() - new Date(a.dataConferencia).getTime());
  }, [conferencias]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          Histórico de Conferências Internas
        </CardTitle>
        <CardDescription>
          Listagem interna sem informações de pagamento ou preço por SKU
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {conferenciasInternas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-16 text-center text-muted-foreground">
                    Nenhuma conferência interna encontrada
                  </TableCell>
                </TableRow>
              ) : (
                conferenciasInternas.map((conferencia) => {
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
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}