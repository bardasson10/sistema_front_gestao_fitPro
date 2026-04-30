import { useFieldArray, useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cor } from "@/types/production";
import { parseNumber } from "@/utils/Formatter/parse-number-format";
import { RoloTecidoFormValues } from "@/schemas/rolo-tecido-schema";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { useFornecedores, useTecidos } from "@/hooks/queries/useMateriais";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import React from "react";
import { useAuth } from "@/hooks/use-auth";

interface StockFabricFormProps {
  cores: Cor[];
  isEditing?: boolean;
}


export function StockFabricForm({ cores, isEditing = false }: StockFabricFormProps) {
  const { control, setValue } = useFormContext<RoloTecidoFormValues>();
  const { user } = useAuth();
  const isAdmin = user?.perfil === "ADM";
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rolos",
  });

  const [selectedFornecedor, setSelectedFornecedor] = React.useState<string | null>(null);

  const { data: fornecedores } = useFornecedores();

  const tecidosFilters = React.useMemo(
    () =>
      selectedFornecedor
        ? {
          fornecedorId: selectedFornecedor,
          page: 1,
          limit: 1000,
        }
        : undefined,
    [selectedFornecedor]
  );

  const { data: tecidosResponse, isFetching: isFetchingTecidos } = useTecidos(tecidosFilters, {
    enabled: !!selectedFornecedor && !isEditing,
  });

  React.useEffect(() => {
    if (!isEditing) {
      setValue("tecidoId", "");
    }
  }, [isEditing, selectedFornecedor, setValue]);

  const tecidosFiltrados = React.useMemo(() => {
    if (!selectedFornecedor || isEditing) {
      return [];
    }

    return tecidosResponse?.data ?? [];
  }, [isEditing, selectedFornecedor, tecidosResponse]);



  return (
    <div className="space-y-4">
      {!isEditing && (
        <>

          <div className="flex w-fullgap-8 justify-between">
            <FormItem className="w-full">
              <FormLabel>Fornecedor</FormLabel>
              <Select onValueChange={(value) => setSelectedFornecedor(value)} value={selectedFornecedor || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {fornecedores?.map((fornecedor) => (
                    <SelectItem key={fornecedor.id} value={fornecedor.id || ""}>
                      {fornecedor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>

            {selectedFornecedor && (
              <FormField
                control={control}
                name="tecidoId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Tecido</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isFetchingTecidos}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tecidosFiltrados.map((tecido) => (
                          <SelectItem key={tecido.id} value={tecido.id}>
                            {tecido.codigoReferencia} - {cores.find((cor) => cor.id === tecido.corId)?.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={control}
              name="dataLote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data do Lote</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(new Date(`${field.value}T00:00:00`), "dd/MM/yyyy", { locale: ptBR })
                            : "Selecione a data"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        locale={ptBR}
                        selected={field.value ? new Date(`${field.value}T00:00:00`) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3 rounded-md border p-3">
            <div className="flex items-center justify-between">
              <FormLabel className="m-0">Pesos dos Rolos (kg)</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ pesoInicialKg: undefined as unknown as number })}
              >
                <Plus className="mr-1 h-4 w-4" />
                Adicionar Peso
              </Button>
            </div>

            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_auto] gap-2">
                  <FormField
                    control={control}
                    name={`rolos.${index}.pesoInicialKg` as const}
                    render={({ field: pesoField }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="text" // Usamos text para o navegador não bloquear a vírgula visualmente
                            inputMode="decimal" // Força o celular a abrir o teclado numérico (com vírgula)
                            placeholder={`Peso do rolo ${index + 1}`}
                            // Transforma o número do form (15.25) em string com vírgula (15,25) para a tela
                            value={pesoField.value !== undefined ? String(pesoField.value).replace(".", ",") : ""}
                            onChange={(e) => {
                              // 1. Pega o que o usuário digitou e troca vírgula por ponto (formato universal)
                              let rawValue = e.target.value.replace(",", ".");

                              // 2. Remove letras ou símbolos indesejados (garante que só tenha números e ponto)
                              rawValue = rawValue.replace(/[^0-9.]/g, "");

                              // 3. Impede a digitação de mais de uma vírgula (ex: 15.25.3)
                              const parts = rawValue.split(".");
                              if (parts.length > 2) return;

                              // 4. Se o usuário apagou tudo
                              if (rawValue === "") {
                                pesoField.onChange(undefined);
                                return;
                              }

                              // 5. TRUQUE DA VÍRGULA: Se o valor terminar com ponto (ex: "15."), 
                              // mandamos a string temporariamente para o hook-form. Isso evita que 
                              // o React corte a vírgula visual enquanto ele não digita o próximo número.
                              if (rawValue.endsWith(".")) {
                                pesoField.onChange(rawValue);
                              } else {
                                // Se for um número completo (ex: "15.25"), passamos pela sua função parseNumber
                                pesoField.onChange(parseNumber(rawValue));
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    disabled={fields.length <= 1}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {isEditing && (
        <>
          <FormField
            control={control}
            name="codigoBarraRolo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código do Rolo</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={!isAdmin}
                    readOnly={!isAdmin}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="pesoAtualKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso Atual (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(parseNumber(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      <FormField
        control={control}
        name="situacao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="reservado">Reservado</SelectItem>
                <SelectItem value="em_uso">Em Uso</SelectItem>
                <SelectItem value="descartado">Descartado</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}