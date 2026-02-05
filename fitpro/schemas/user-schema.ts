import z from "zod";

export const createUserSchema = z.object({
        nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        email: z.email("Email inválido"),
        senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
        perfil: z.enum(["ADM", "GERENTE", "FUNCIONARIO"]).optional().default("FUNCIONARIO"),
        funcaoSetor: z.string().optional(),
});

export const authenticateUserSchema = z.object({
    email: z.email("Email inválido"),
    senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export type AuthenticateUserSchemaFormValues = z.infer<typeof authenticateUserSchema>;


export const authResponseSchema = z.object(
    {
        id: z.uuid(),
        nome: z.string(),
        email: z.string(),
        perfil: z.enum(["ADM", "GERENTE", "FUNCIONARIO"]),
        token: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
    }
);

export type AuthResponse = z.infer<typeof authResponseSchema>;