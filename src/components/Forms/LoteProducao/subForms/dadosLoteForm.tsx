
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { Colaborador } from "@/types/production";
import { PaginatedResponse } from "@/hooks/queries/useColaboradores";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dataFormatter } from "@/utils/Formatter/data-brasil-format";
import { ILoteResponse, IRequestBodyUpdateLote, STATUS_LOTE_OPTIONS, TStatusLote } from "@/types/Lote";


interface DadosLoteFormProps {
  form: UseFormReturn<LoteProducaoFormValues>;
  lote: ILoteResponse;
  colaboradoresResponse: PaginatedResponse<Colaborador> | undefined;
  handleEditLoteCabeçalho: (id: string, values: IRequestBodyUpdateLote) => Promise<void>
}
export const DadosLoteForm = ({ form, lote, colaboradoresResponse, handleEditLoteCabeçalho }: DadosLoteFormProps) => {
  const colaboradores = Array.isArray(colaboradoresResponse)
    ? colaboradoresResponse
    : (colaboradoresResponse?.data || []);

    const isTStatusLote = (value: string): value is TStatusLote => {
      return value in STATUS_LOTE_OPTIONS;
    };
  return (
    <section className="space-y-6">
      {/* Header - Informações do Lote */}
      <div className="space-y-4 p-5 border rounded-lg bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Informações do Lote</h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="block text-xs text-muted-foreground mb-1 uppercase font-medium">
              Data de Criação
            </Label>
            <span className="text-sm font-medium">
              {lote.createdAt ? dataFormatter(lote.createdAt) : '-'}
            </span>
          </div>

          <div>
            <Label className="block text-xs text-muted-foreground mb-1 uppercase font-medium">
              Status
            </Label>
            <Badge
              className="h-7 px-3 font-medium"
              variant={
                lote.status === 'lote_criado'
                  ? 'secondary'
                  : lote.status === 'enfesto'
                    ? 'outline'
                    : lote.status === 'cortado'
                      ? 'destructive'
                      : 'default'
              }
            >
              {lote.status?.replace('_', ' ').toUpperCase() || 'PLANEJADO'}
            </Badge>
          </div>

          <div>
            <Label className="block text-xs text-muted-foreground mb-1 uppercase font-medium">
              Responsável
            </Label>
            <span className="text-sm font-medium">
              {lote.responsavel?.nome?.toUpperCase() || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Edição - Dados do Lote */}
      <div className="space-y-4 p-5 border rounded-lg bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Editar Dados do Lote</h3>

        <div>
          <Label className="text-sm font-medium">ID do Lote</Label>
          <Input
            value={form.watch("codigoLote")}
            className="bg-muted"
            onChange={(e) => form.setValue("codigoLote", e.target.value)}
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Responsável</Label>
          <Select
            onValueChange={(value) => form.setValue("responsavel.id", value)}
            value={form.watch("responsavel.id") || undefined}
          >
            <SelectTrigger disabled={colaboradores.length === 0}>
              <SelectValue placeholder="Selecione um responsável" />
            </SelectTrigger>
            <SelectContent>
              {colaboradores.map(col => (
                <SelectItem key={col.id} value={col.id}>{col.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Status</Label>
          <Select
            onValueChange={(value) => {
              form.setValue("status", value as TStatusLote);
            }}
            value={form.watch("status")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um status" />
            </SelectTrigger>
            <SelectContent>
              {
                Object.entries(STATUS_LOTE_OPTIONS).map(([statusKey, statusLabel]) => (
                  <SelectItem key={statusKey} value={statusKey}>
                    {statusLabel}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Observação</Label>
          <Textarea
            {...form.register("observacao")}
            onChange={(value) => form.setValue("observacao", value.target.value)}
            placeholder="Digite uma observação"
            className="resize-none h-24"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => {
            const formValues = form.getValues();
            const payload: IRequestBodyUpdateLote = {
              codigoLote: formValues.codigoLote,
              responsavelId: formValues.responsavel?.id,
              status: formValues.status,
              observacao: formValues.observacao,
            };

            handleEditLoteCabeçalho(formValues.id, payload);
          }}
          className="flex-1"
        >
          Salvar Alterações
        </Button>
      </div>
    </section>
  );
};