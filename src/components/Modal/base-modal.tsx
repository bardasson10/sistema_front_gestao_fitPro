import { ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface BaseModalProps {
  trigger?: ReactNode
  Icon?: ReactNode
  title?: string
  description?: string
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function BaseModal({ trigger, Icon, title, description, children, open, onOpenChange }: BaseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-300 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {title && <DialogTitle className="flex items-center">{Icon}{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}