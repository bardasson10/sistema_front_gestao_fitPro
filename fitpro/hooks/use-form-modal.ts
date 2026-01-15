import { useState } from 'react';
import { UseFormReturn, FieldValues, DefaultValues, Path } from 'react-hook-form';
import { set } from 'zod';

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