import * as z from "zod";

export const roloTecidoSchema = z.object({
  tecidoId: z.string().min(1, "Selecione um tecido"),
  identificacao: z.string().min(1, "A identificação é obrigatória"),
  pesoKg: z.number().min(0.1, "O peso deve ser no mínimo 0.1 Kg"),
  status: z.enum(["disponivel", "reservado", "utilizado"]),
});

export type RoloTecidoFormValues = z.infer<typeof roloTecidoSchema>;