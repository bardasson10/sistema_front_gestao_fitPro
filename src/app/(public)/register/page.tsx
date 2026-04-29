"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createUserSchema } from "@/schemas/user-schema";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/services/api/api";
import { PERFIL_OPTIONS } from "@/constants/perfil";

type RegisterFormValues = z.input<typeof createUserSchema>;

const initialValues: RegisterFormValues = {
    nome: "",
    email: "",
    senha: "",
    perfil: "FUNCIONARIO",
    funcaoSetor: "",
};

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: initialValues,
    });

    const onSubmit = form.handleSubmit(async (values) => {
        setIsLoading(true);
        try {
            const payload = createUserSchema.parse(values);
            await api.post("/users", payload);
            toast.success("Usuário criado com sucesso!");
            router.push("/login");
        } catch {
            toast.error("Erro ao criar usuário. Verifique os dados.");
        } finally {
            setIsLoading(false);
        }
    });

    return (
        <main className="min-h-screen flex items-center justify-center0 px-4">
            {/* <div className="w-full max-w-md  p-6 rounded-lg shadow">
                <h1 className="text-2xl font-semibold mb-6 text-center">
                    Criar usuário
                </h1>

                <Form {...form}>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome completo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Ana Souza" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="user@email.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="senha"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Senha</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Mínimo 6 caracteres"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="perfil"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Perfil</FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {PERFIL_OPTIONS.map((perfil) => (
                                                <SelectItem key={perfil.value} value={perfil.value}>
                                                    {perfil.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="funcaoSetor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Função / Setor</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Costura" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "Criando..." : "Criar usuário"}
                        </Button>

                        <p className="text-center text-sm text-gray-600">
                            Já tem conta?{" "}
                            <Link
                                href="/login"
                                className="text-blue-600 hover:underline"
                            >
                                Entrar
                            </Link>
                        </p>
                    </form>
                </Form>
            </div> */}
        </main>
    );
}