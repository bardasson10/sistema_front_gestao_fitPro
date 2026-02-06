import { useState } from 'react';
import { UseFormReturn, FieldValues, DefaultValues, Path } from 'react-hook-form';

interface UseFormModalProps<T extends FieldValues, TItem extends { id: string } = { id: string }> {
  form: UseFormReturn<T>;
  initialValues: DefaultValues<T>;
  onSave: (values: T, id?: string) => void;
  transformItemToForm?: (item: TItem) => T;
}

export function useFormModal<T extends FieldValues, TItem extends { id: string } = { id: string }>({
  form,
  initialValues,
  onSave,
  transformItemToForm,
}: UseFormModalProps<T, TItem>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TItem | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);


  const handleOpen = () => {
    setEditingItem(null);
    form.reset(initialValues);
    setIsOpen(true);
  };

  const handleEdit = (item: TItem) => {
    setEditingItem(item);
    const formValues = transformItemToForm ? transformItemToForm(item) : (item as unknown as T);
    form.reset(formValues);
    setIsOpen(true);
  };


  const handleClose = () => {
    setIsOpen(false);
    setEditingItem(null);
    form.reset(initialValues);
  };

  const onSubmit = (values: T) => {
    onSave?.(values, editingItem?.id);
    handleClose();
  };

  const handleRemove = (id: string) => {
    setIsRemoveOpen(true);
    setRemovingItemId(id);
  }




  return {
    isOpen,
    removingItemId,
    handleRemove,
    isRemoveOpen,
    setIsRemoveOpen,
    setIsOpen,
    editingItem,
    handleOpen,
    handleEdit,
    handleClose,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
  };
}