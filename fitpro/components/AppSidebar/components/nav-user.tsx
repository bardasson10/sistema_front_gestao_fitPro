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
// import { useContextUser } from "@/hooks/use-context-user"
import { Skeleton } from "@/components/ui/skeleton"
import { LogOutButton } from "@/components/LoginForms/logout-button"
import { useState } from "react"

export function NavUser() {
  const { isMobile } = useSidebar()

  // depois ajustar para pegar do contexto
  const [user, setUser] = useState({
    nome: "BJ",
    email: "",
    urlAvatar: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  // const { user, isLoading } = useContextUser();

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
                <AvatarImage src={user.urlAvatar} alt={user.nome} />
                <AvatarFallback className="rounded-lg uppercase">{user.nome ? user.nome.charAt(0) : null}</AvatarFallback>
              </Avatar>
              }
              <div className="grid flex-1 text-left text-sm leading-tight gap-1">
                <span className="truncate font-medium">{isLoading ? <Skeleton className="h-4 w-full" /> : user.nome}</span>
                <span className="truncate text-xs text-muted-foreground">{isLoading ? <Skeleton className="h-3 w-full" /> : user.email}</span>
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
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.urlAvatar} alt={user.nome} />
                  <AvatarFallback className="rounded-lg">{user.nome ? user.nome.charAt(0) : null}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.nome}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
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
