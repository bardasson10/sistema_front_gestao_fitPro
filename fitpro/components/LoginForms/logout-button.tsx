'use client'
import { LogOut } from "lucide-react";
import { Button } from "../ui/button";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";


export function LogOutButton() {

  const handleLogout = async () => {
    console.log("Logging out...");
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