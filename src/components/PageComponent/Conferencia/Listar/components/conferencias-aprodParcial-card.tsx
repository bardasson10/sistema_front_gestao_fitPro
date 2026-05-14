'use client';

import { useMemo, useState } from 'react';
import { Eye, History, Pencil } from 'lucide-react';
import { Conferencia } from '@/types/Conferencia';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusQualidadeBadge } from './statusBagde-conferencia';
import { dataFormatter } from '@/utils/Formatter/data-brasil-format';
import { ConferenciaDetalhesModal } from './conferencia-detalhes-modal';
import { ConferenciaEdicaoModal } from './conferencia-edicao-modal';

interface ConferenciasAprodParcialCardProps {
  conferencias: Conferencia[];
  onEdit?: (conferencia: Conferencia) => void;
}

const isConferenciaInterna = (conferencia: Conferencia) => conferencia.isProducaoInterna === false;

export function ConferenciasAprodParcialCard({ conferencias, onEdit }: ConferenciasAprodParcialCardProps) {
  const [selectedConferencia, setSelectedConferencia] = useState<Conferencia | null>(null);
  const [editingConferencia, setEditingConferencia] = useState<Conferencia | null>(null);

  const conferenciasAprodParcial = useMemo(() => {
    return (conferencias || [])
      .filter(isConferenciaInterna)
      .sort((a, b) => new Date(b.dataConferencia).getTime() - new Date(a.dataConferencia).getTime());
  }, [conferencias]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          Histórico de Conferências Aprovadas Parcialmente
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
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conferenciasAprodParcial.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-16 text-center text-muted-foreground">
                    Nenhuma conferência aprovada parcialmente encontrada
                  </TableCell>
                </TableRow>
              ) : (
                conferenciasAprodParcial.map((conferencia) => {
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
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onEdit) {
                                onEdit(conferencia);
                                return;
                              }

                              setEditingConferencia(conferencia);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedConferencia(conferencia)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                          </Button>
                        </div>
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

      <ConferenciaEdicaoModal
        conferencia={editingConferencia}
        open={!!editingConferencia}
        onOpenChange={(open) => {
          if (!open) {
            setEditingConferencia(null);
          }
        }}
      />
    </Card>
  );
}