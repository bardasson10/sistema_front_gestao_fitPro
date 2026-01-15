import { BaseModal } from "@/components/Modal/base-modal"
import { Button } from "@/components/ui/button";

interface RemoveItemWarningProps {
  title: string;
  isOpen?: boolean;
  id: string;
  onConfirm: (id: string) => void;
  onClose: () => void;
}


export const RemoveItemWarning = ({ title, isOpen, onClose, id, onConfirm }: RemoveItemWarningProps) => {
  return (
    <section>
      <BaseModal
        open={isOpen}
        onOpenChange={onClose}
        title={title}
        >
          <div>
            <p className="font-bold text-md text-red-500 text-center">Esta ação não poderá ser desfeita e o tecido será excluído permanentemente.</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button variant="destructive" onClick={() => onConfirm(id)}>Remover</Button>
            </div>
          </div>
        </BaseModal>
    </section>
  )
}