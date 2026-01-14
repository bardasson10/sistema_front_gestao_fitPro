'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ChartColumnIncreasing } from "lucide-react"
import { NavMain } from "./components/nav-main"
import { NavUser } from "./components/nav-user"

const data = {
  navMain: {
    groupTitle: "Dados",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: ChartColumnIncreasing,
      },
      {
        title: "Tecidos",
        url: "/tecidos",
        icon: ChartColumnIncreasing,
      },
    ],
  }
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