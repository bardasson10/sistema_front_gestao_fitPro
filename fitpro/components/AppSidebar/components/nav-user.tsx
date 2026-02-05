"use client"

import {
  BadgeCheck,
  ChevronsUpDown,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { ThemeToggle } from "@/components/ThemeToggle"
import { Skeleton } from "@/components/ui/skeleton"
import { LogOutButton } from "@/components/LoginForms/logout-button"
import { useAuth } from "@/hooks/use-auth"
import { Badge } from "@/components/ui/badge"

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

export function NavUser() {
  const { isMobile } = useSidebar()
  const { userData, isLoading } = useAuth();

  const user = userData ? {
    nome: userData.nome,
    email: userData.email,
    perfil: userData.perfil,
    urlAvatar: "",
  } : null;

  const initials = user?.nome
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || "";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isLoading}>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              {isLoading ? <Skeleton className="aspect-square size-8" /> :
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.urlAvatar} alt={user?.nome} />
                <AvatarFallback className="rounded-lg uppercase bg-primary text-primary-foreground font-semibold">{initials}</AvatarFallback>
              </Avatar>
              }
              <div className="grid flex-1 text-left text-sm leading-tight gap-1">
                <span className="truncate font-medium">{isLoading ? <Skeleton className="h-4 w-full" /> : user?.nome}</span>
                <span className="truncate text-xs text-muted-foreground">{isLoading ? <Skeleton className="h-3 w-full" /> : user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex flex-col gap-2 px-1 py-1.5 text-left text-sm">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.urlAvatar} alt={user?.nome} />
                    <AvatarFallback className="rounded-lg uppercase bg-primary text-primary-foreground font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user?.nome}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </div>
                {user?.perfil && (
                  <Badge className={`w-fit text-xs ${getPerfilColor(user.perfil)}`}>
                    {getPerfilLabel(user.perfil)}
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {/* <Link href='/conta' passHref> */}
              <DropdownMenuItem className="cursor-pointer">
                <BadgeCheck />
                Conta
              </DropdownMenuItem>
              {/* </Link> */}
              <DropdownMenuItem>
                <ThemeToggle />
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <LogOutButton />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
