'use client';

import { BaseModal } from '@/components/Modal/base-modal';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Conferencia } from '@/types/Conferencia';
import { dataFormatter } from '@/utils/Formatter/data-brasil-format';
import { StatusQualidadeBadge } from './statusBagde-conferencia';

interface ConferenciaDetalhesModalProps {
  conferencia: Conferencia | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getQuebra = (enviado: number, recebido: number) => Math.max(0, enviado - recebido);

export function ConferenciaDetalhesModal({ conferencia, open, onOpenChange }: ConferenciaDetalhesModalProps) {
  if (!conferencia) {
    return null;
  }

  const totalEnviado = conferencia.items.reduce((acc, item) => acc + item.quantidadeEnviada, 0);
  const totalRecebido = conferencia.items.reduce((acc, item) => acc + item.qtdRecebida, 0);
  const totalDefeito = conferencia.items.reduce((acc, item) => acc + item.qtdDefeito, 0);
  const totalQuebra = conferencia.items.reduce(
    (acc, item) => acc + getQuebra(item.quantidadeEnviada, item.qtdRecebida),
    0,
  );

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Conferência - ${conferencia.direcionamento.faccao.nome}`}
      description="Verificação completa das informações da conferência"
    >
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Serviço</p>
                <p className="font-medium capitalize">{conferencia.direcionamento.tipoServico || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Responsável</p>
                <p className="font-medium">{conferencia.responsavel.nome || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status de Qualidade</p>
                <StatusQualidadeBadge status={conferencia.statusQualidade} />
              </div>
              <div>
                <p className="text-muted-foreground">Data</p>
                <p className="font-medium">{dataFormatter(conferencia.dataConferencia)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm sm:grid-cols-4">
              <div className="rounded-md border p-2">
                <p className="text-muted-foreground">Enviado</p>
                <p className="font-semibold">{totalEnviado}</p>
              </div>
              <div className="rounded-md border p-2">
                <p className="text-muted-foreground">Recebido</p>
                <p className="font-semibold">{totalRecebido}</p>
              </div>
              <div className="rounded-md border p-2">
                <p className="text-muted-foreground">Defeito</p>
                <p className="font-semibold">{totalDefeito}</p>
              </div>
              <div className="rounded-md border p-2">
                <p className="text-muted-foreground">Quebra</p>
                <p className="font-semibold">{totalQuebra}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Itens Conferidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tam</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead className="text-right">Enviado</TableHead>
                    <TableHead className="text-right">Recebido</TableHead>
                    <TableHead className="text-right">Defeito</TableHead>
                    <TableHead className="text-right">Quebra</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conferencia.items.map((item) => {
                    const quebra = getQuebra(item.quantidadeEnviada, item.qtdRecebida);

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{item.produto.nome}</span>
                            <span className="text-xs text-muted-foreground">{item.produto.sku}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.tamanho}</Badge>
                        </TableCell>
                        <TableCell>{item.cor.nome}</TableCell>
                        <TableCell className="text-right">{item.quantidadeEnviada}</TableCell>
                        <TableCell className="text-right font-medium">{item.qtdRecebida}</TableCell>
                        <TableCell className="text-right">{item.qtdDefeito}</TableCell>
                        <TableCell className="text-right">{quebra}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {conferencia.observacao && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Observação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{conferencia.observacao}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </BaseModal>
  );
}
