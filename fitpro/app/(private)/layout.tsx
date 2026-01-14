import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarInset } from "@/components/ui/sidebar";
import { PrivateProviders } from "@/providers/PrivateContexts";


export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PrivateProviders>
      <AppSidebar />
      <ScrollArea className="w-full h-screen">
        <SidebarInset>
          <Header />
          <div className="flex flex-1 flex-col gap-4 p-2 md:py-4 md:px-8">
            {children}
          </div>
        </SidebarInset>
      </ScrollArea>
    </PrivateProviders>
  );
}
