'use client';
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOutButton } from "@/components/LoginForms/logout-button";
import { User, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const getPerfilLabel = (perfil: string) => {
  const labels: Record<string, string> = {
    ADM: "Administrador",
    GERENTE: "Gerente",
    FUNCIONARIO: "Funcionário",
  };
  return labels[perfil] || perfil;
};

const getPerfilColor = (perfil: string) => {
  const colors: Record<string, string> = {
    ADM: "bg-red-500 hover:bg-red-600",
    GERENTE: "bg-blue-500 hover:bg-blue-600",
    FUNCIONARIO: "bg-green-500 hover:bg-green-600",
  };
  return colors[perfil] || "bg-gray-500 hover:bg-gray-600";
};

export function UserNav() {
  const { userData, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const initials = userData.nome
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userData.nome}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userData.email}
            </p>
            <Badge className={`mt-2 w-fit text-xs ${getPerfilColor(userData.perfil)}`}>
              {getPerfilLabel(userData.perfil)}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <button className="w-full cursor-pointer flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Perfil</span>
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <button className="w-full cursor-pointer flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </button>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="p-0">
          <LogOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
