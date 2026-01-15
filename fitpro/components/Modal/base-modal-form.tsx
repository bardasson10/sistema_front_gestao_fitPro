import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { BaseModal } from "./base-modal"
import { Spinner } from "../ui/spinner"

interface FormModalProps {
  trigger?: ReactNode
  title: string
  children: ReactNode
  onSubmit: (e: any) => void
  onClose: () => void
  open: boolean
  submitText?: string
  loading?: boolean
}

export function FormModal({ 
  trigger, title, children, onSubmit, onClose, open, submitText = "Salvar", loading 
}: FormModalProps) {
  return (
    <BaseModal
      open={open} 
      onOpenChange={(val) => !val && onClose()} 
      trigger={trigger} 
      title={title}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner /> : submitText}
          </Button>
        </div>
      </form>
    </BaseModal>
  )
}