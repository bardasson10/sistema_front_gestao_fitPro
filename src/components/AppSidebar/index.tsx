'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { BookType, Cable, CirclePile, House, LayoutDashboard, NotebookPen, PackageOpen, PackageSearch, PaintBucket, Scissors, Shirt, SquareChartGantt, User } from "lucide-react"
import { NavMain } from "./components/nav-main"
import { NavUser } from "./components/nav-user"

const data = {
  navMain: [
    {
      groupTitle: "Analise",
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      groupTitle: "Gestão",
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
      ],
    },
    {
      groupTitle: "Materiais",
      items: [
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
      ],
    },
    {
      groupTitle: "Estoque",
      items: [
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
        {
          title: "Produtos",
          url: "/produtos",
          icon: PackageOpen,
        },
        {
          title: "Estoque de Rolos",
          url: "/estoque-rolo",
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
          title: "Estoque Peças",
          url: "/estoque-corte",
          icon: PackageSearch,
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