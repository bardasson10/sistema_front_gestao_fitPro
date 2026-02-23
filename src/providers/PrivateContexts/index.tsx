import { getSidebarState } from "@/utils/Cookies/sidebar"
import { SidebarProvider } from "./SidebarProvider"
import { ProductionProvider } from "./ProductionProvider"



interface ProvidersProps {
  children: React.ReactNode
}

export async function PrivateProviders({ children }: ProvidersProps) {
  const lastState = await getSidebarState()

  return (
    <>
      {/* <UserProvider> */}
      <ProductionProvider>
        <SidebarProvider defaultOpen={lastState}>
          {children}
        </SidebarProvider>
      </ProductionProvider>
      {/* </UserProvider> */}
    </>
  )
}
