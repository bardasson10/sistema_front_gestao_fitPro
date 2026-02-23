'use client'
import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { removeAuthCookies } from "@/utils/Cookies/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


export function LogOutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await removeAuthCookies();
      toast.success("Logout realizado com sucesso!");
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout. Tente novamente.");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size='sm' className="w-full justify-start font-normal hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20 dark:hover:text-destructive">
          <LogOut />
          LogOut
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>LogOut</DialogTitle>
          <DialogDescription className="text-base">Tem certeza que deseja sair do sistema?</DialogDescription>
          <DialogDescription className="text-base">Você deverá informar email e senha novamente para acessá-lo.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleLogout}
          className="font-semibold transition-all hover:brightness-110 hover:shadow-md dark:bg-destructive dark:text-white dark:hover:bg-destructive/90">Sair</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}