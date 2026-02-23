"use client"

import { useTheme } from "next-themes"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark";

  return (
    <div className="relative grid grid-cols-[1fr_auto] w-full">
      <Label htmlFor="theme-toggle" className="cursor-pointer font-normal">
        {isDark ? <Moon className="h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" /> : <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />}
        Tema
      </Label>
      <Switch
        id='theme-toggle'
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
    </div>
  )
}
