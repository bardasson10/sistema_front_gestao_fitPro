'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { BookType, Cable, CirclePile, House, LayoutDashboard, NotebookPen, PackageOpen, PackageSearch, PaintBucket, Scissors, Shirt, ShoppingBag, SquareChartGantt, User } from "lucide-react"
import { NavMain } from "./components/nav-main"
import { NavUser } from "./components/nav-user"
import { title } from "process"

const data = {
  navMain: [
    {
      groupTitle: "Análise",
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      groupTitle: "Cadastros",
      items: [
        {
          title: "Colaboradores",
          url: "/colaboradores",
          icon: User,
        },
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
          title: "Cores",
          url: "/cor",
          icon: PaintBucket,
        },
        {
          title: "Tecidos",
          url: "/tecidos",
          icon: Shirt,
        },
        {
          title: "Tamanhos",
          url: "/tamanhos",
          icon: Shirt,
        },
        {
          title: "Tipos de Produtos",
          url: "/tipos-produtos",
          icon: BookType,
        },
      ],
    },
    {
      groupTitle: "Estoque",
      items: [
        {
          title: "Produtos",
          url: "/produtos",
          icon: PackageOpen,
        },
        {
          title: "Estoque de Tecidos",
          url: "/estoque-tecidos",
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
          icon: Scissors,
        },
        {
          title: "Peças em estoque",
          url: "/estoque-corte",
          icon: PackageSearch,
        },
        {
          title: "Produção Interna",
          url: "/producao",
          icon: ShoppingBag,
        },
        {
          title: "Remessas",
          url: "/remessas-direcionadas",
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