import { useState, useMemo } from "react";

export function useGradeEdicao(isEditing: boolean) {
  const [modoAdicaoItens, setModoAdicaoItens] = useState(false);
  const [isGradeEditMode, setIsGradeEditMode] = useState(false);

  const podeEditar = useMemo(() => {
    if (!isEditing) return true; // criação pode tudo
    if (modoAdicaoItens) return true; // modo especial pode
    return isGradeEditMode; // só edita se estiver em modo edição
  }, [isEditing, modoAdicaoItens, isGradeEditMode]);

  return {
    modoAdicaoItens,
    setModoAdicaoItens,
    isGradeEditMode,
    setIsGradeEditMode,
    podeEditar,
  };
}