import { useState } from 'react';
import { UseFormReturn, FieldValues, DefaultValues, Path } from 'react-hook-form';

interface UseFormModalProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  initialValues: DefaultValues<T>;
  onSave: (values: T, id?: string) => void;
}

export function useFormModal<T extends FieldValues, TItem extends { id: string }>({
  form,
  initialValues,
  onSave,
}: UseFormModalProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TItem | null>(null);

  const handleOpen = () => {
    setEditingItem(null);
    form.reset(initialValues);
    setIsOpen(true);
  };

  const handleEdit = (item: TItem) => {
    setEditingItem(item);
    form.reset(item as unknown as any);
    setIsOpen(true);
  };


  const handleClose = () => {
    setIsOpen(false);
    setEditingItem(null);
    form.reset(initialValues);
  };

  const onSubmit = (values: T) => {
    onSave(values, editingItem?.id);
    handleClose();
  };

  return {
    isOpen,
    setIsOpen,
    editingItem,
    handleOpen,
    handleEdit,
    handleClose,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
  };
}