'use client';
import { usePathname } from "next/navigation";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";


export const Header = () => {

  const pathname = usePathname()

  const getPageTitle = () => {
    switch (pathname) {
      case '/':
        return ' - Dashboard'
      default:
        return ''
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-lg font-medium tracking-wide">
          <span className="hidden md:inline">Controle de Planejamento
            {getPageTitle()}
          </span>
        </h1>
      </div>
    </header>
  )
}