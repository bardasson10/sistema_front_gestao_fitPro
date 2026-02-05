
import { api } from "../api/api"
import { AuthResponse } from "@/schemas/user-schema";
import { toast } from "sonner";

interface AutenticacaoServiceProps {
    email: string;
    senha: string;
}

export const AutenticacaoService = async ({email, senha}: AutenticacaoServiceProps) : Promise<AuthResponse> => {
    
    
    try{
        const res = await api.post("/session", {
        email: email,
        senha: senha
    })

    return res.data as AuthResponse;
        
    }
    catch(error){
        toast.error("Erro ao autenticar usuário");
        throw new Error("Erro ao autenticar usuário");
        
    }


    

}