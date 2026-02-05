
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuthenticateUserSchemaFormValues } from "@/schemas/user-schema";

export function LoginForm() {
    const { control } = useFormContext<AuthenticateUserSchemaFormValues>();

    return (
        <div className="space-y-4">
            <FormField
                control={control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input {...field} placeholder="user@example.com" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="senha"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl><Input {...field} placeholder="*******" type="password" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

        </div>
    );
}