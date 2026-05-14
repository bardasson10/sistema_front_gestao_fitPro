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
  const shouldRenderContent = open === undefined || open;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {shouldRenderContent && (
        <DialogContent className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            {title && <DialogTitle className="flex items-center">{Icon}{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          {children}
        </DialogContent>
      )}
    </Dialog>
  )
}