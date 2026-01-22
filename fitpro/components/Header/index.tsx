'use client';
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "../ui/sidebar";
import { cn } from "@/lib/utils";

export const Header = () => {
  const pathname = usePathname();

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      '/': 'Dashboard',
      '/tecidos': 'Tecidos',
      '/colaboradores': 'Colaboradores',
      '/fornecedores': 'Fornecedores',
      '/faccoes': 'Facções',
      '/rolos': 'Rolos de Tecido',
    };
    return titles[pathname] || '';
  };

  const getDescription = () => {
    const descriptions: Record<string, string> = {
      '/': 'Visão geral do sistema',
      '/tecidos': 'Gerencie seus tecidos',
      '/colaboradores': 'Gerencie seus colaboradores',
      '/fornecedores': 'Gerencie seus fornecedores',
      '/faccoes': 'Gerencie suas facções',
      '/rolos': 'Gerencie seus rolos de tecido',
    };
    return descriptions[pathname] || '';
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-9 w-9 mb-0 sm:mb-4" />
        
        <div className="flex flex-col justify-center overflow-hidden">
          <h1 className="text-sm font-semibold leading-none tracking-tight sm:text-lg truncate">
            {getPageTitle()}
          </h1>

          <p className="text-[11px] mt-1 text-muted-foreground sm:text-xs truncate">
            {getDescription()}
          </p>
        </div>
      </div>

      {/* Espaço para ações globais (notificação, perfil) se houver no futuro */}
      <div className="flex items-center gap-2">
        {/* Ex: <UserNav /> */}
      </div>
    </header>
  );
};