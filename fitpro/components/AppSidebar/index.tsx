'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Cable, CirclePile, House, LayoutDashboard, NotebookPen, PackageOpen, PackageSearch, Shirt, SquareChartGantt, User } from "lucide-react"
import { NavMain } from "./components/nav-main"
import { NavUser } from "./components/nav-user"

const data = {
  navMain: [
    {
      groupTitle: "Gestão",
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: LayoutDashboard,
        },
        {
          title: "Colaboradores",
          url: "/colaboradores",
          icon: User,
        },
      ],
    },
    {
      groupTitle: "Produtos",
      items: [
        {
          title: "Produtos",
          url: "/produtos",
          icon: PackageOpen,
        },
        {
          title: "Tipos de Produtos",
          url: "/tipos-produtos",
          icon: PackageOpen,
        },
      ],
    },
    {
      groupTitle: "Materiais",
      items: [
        {
          title: "Fornecedores",
          url: "/fornecedores",
          icon: Cable,
        },
        {
          title: "Facções",
          url: "/faccoes",
          icon: House,
        },
        {
          title: "Tecidos",
          url: "/tecidos",
          icon: Shirt,
        },
      ],
    },
    {
      groupTitle: "Estoque",
      items: [
        {
          title: "Estoque",
          url: "/estoque",
          icon: CirclePile,
        },
      ],
    },
    {
      groupTitle: "Produção",
      items: [
        {
          title: "Lotes",
          url: "/lotes",
          icon: PackageSearch,
        },
        {
          title: "Produção",
          url: "/producao",
          icon: SquareChartGantt,
        },
        {
          title: "Conferência",
          url: "/conferencia",
          icon: NotebookPen,
        },
      ],
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader />
      <SidebarContent>
        <NavMain menu={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}