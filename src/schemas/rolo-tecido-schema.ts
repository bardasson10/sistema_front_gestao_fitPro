import * as z from "zod";

const roloLoteSchema = z.object({
  pesoInicialKg: z.coerce // <-- ADICIONE O .coerce AQUI
    .number({ error: "O peso deve ser um número" })   
    .nonnegative("Peso inicial inválido")
    .refine((value) => value > 0, "Peso inicial deve ser maior que zero"),
});

export const roloTecidoSchema = z.object({
  tecidoId: z.uuid("ID de tecido inválido"),
  prefixo: z.string().optional(),
  dataLote: z
    .string()
    .min(1, "Data do lote é obrigatória")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data do lote inválida"),
  rolos: z
    .array(roloLoteSchema)
    .min(1, "Adicione ao menos um peso para criar os rolos"),
  codigoBarraRolo: z.string(),
  pesoAtualKg: z.number().nonnegative("Peso atual inválido"),
  situacao: z.enum(["disponivel", "reservado", "em_uso", "descartado", "esgotado", ""]),
});

export type RoloTecidoFormValues = z.infer<typeof roloTecidoSchema>;