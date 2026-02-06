import * as z from "zod";

export const roloTecidoSchema = z.object({
  tecidoId: z.uuid("ID de tecido inválido"),
  codigoBarraRolo: z.string().min(1, "Código de barra é obrigatório"),
  pesoInicialKg: z.number().positive("Peso inicial deve ser positivo"),
  pesoAtualKg: z.number().positive("Peso atual deve ser positivo"),
  situacao: z.enum(["disponivel", "reservado", "em_uso", "descartado", ""]),
});

export type RoloTecidoFormValues = z.infer<typeof roloTecidoSchema>;