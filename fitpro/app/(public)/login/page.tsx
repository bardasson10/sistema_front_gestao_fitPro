"use client";
import { useRouter } from 'next/navigation'; 
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/Forms/login/login-form";
import { Form } from "@/components/ui/form";
import { authenticateUserSchema, AuthenticateUserSchemaFormValues } from "@/schemas/user-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AutenticacaoService } from "@/services/autenticacao/autenticacao-service";
import { saveAuthCookies } from "@/utils/Cookies/auth";
import { toast } from "sonner";
import { useState } from "react";

const initialValues: AuthenticateUserSchemaFormValues = {
  email: '',
  senha: '',
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AuthenticateUserSchemaFormValues>({
    resolver: zodResolver(authenticateUserSchema),
    defaultValues: initialValues,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsLoading(true);
    try {
      const authResponse = await AutenticacaoService({ email: values.email, senha: values.senha });
      
      // Salvar dados do usuário nos cookies
      await saveAuthCookies({
        id: authResponse.id,
        nome: authResponse.nome,
        email: authResponse.email,
        perfil: authResponse.perfil,
        token: authResponse.token,
      });

      toast.success('Login realizado com sucesso!');
      
      // Redirecionar para dashboard
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Erro ao autenticar:', error);
      toast.error('Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <main className="flex ">
      <Card className="w-full max-w-sm">
        <Form {...form}>
          <CardHeader>
            <CardTitle>Acesse a conta atraves do Login</CardTitle>
            <CardDescription>Insira suas credenciais para continuar.</CardDescription>
            <CardAction>
              <Button variant="link">Crie sua conta</Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isLoading} onClick={onSubmit}>
              {isLoading ? "Entrando..." : "Login"}
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </main>
  );
}