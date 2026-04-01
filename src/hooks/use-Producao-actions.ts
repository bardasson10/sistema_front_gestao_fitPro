import { useState, useCallback } from "react";
import {
    IRequestBodyAddItensLote,
    IRequestBodyAddRolosLote,
    IRequestBodyUpdateLote,
    IRequestBodyCreateLote,
    ILoteResponse
}
    from '@/types/Lote';
import { usePostAddItensLote, usePostAddRolosLote, usePostCreateLoteProducao, usePostUpdateLote } from "./queries/Lote/useLote";



export function useProducaoActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: criarLote } = usePostCreateLoteProducao();
  const { mutateAsync: adicionarItensLote } = usePostAddItensLote();
  const { mutateAsync: atualizarLote } = usePostUpdateLote();
  const { mutateAsync: adicionarRolosLote } = usePostAddRolosLote();

  /**
   * Transforma os dados brutos do formulário/interface no payload de CRIAÇÃO
   */
  const handleCriarLote = useCallback(async (values: IRequestBodyCreateLote) => {
    setIsSubmitting(true);
    try {

      const payload: IRequestBodyCreateLote = {
        codigoLote: values.codigoLote,
        responsavelId: values.responsavelId,
        status: values.status || 'planejado',
        observacao: values.observacao,
        rolos: values.rolos,
      };

      await criarLote({ body: payload });
    } finally {
      setIsSubmitting(false);
    }
  }, [criarLote]);

  /**
   * Transforma os dados para ADICIONAR ITENS (Enfestos/Grades)
   */
  const handleAdicionarItens = useCallback(async (id: string, values: IRequestBodyAddItensLote | IRequestBodyAddItensLote[]) => {
    setIsSubmitting(true);
    try {
      const valuesArray = Array.isArray(values) ? values : [values]

      const payload: IRequestBodyAddItensLote[] = valuesArray.map((value) => ({
        corId: value.corId!,
        qtdFolhas: value.qtdFolhas || 0,
        rolosProducao: value.rolosProducao?.map(r => ({
          estoqueRoloId: r.estoqueRoloId!,
        })) || [],
        itens: value.itens?.map(g => ({
          produtoId: g.produtoId!,
          tamanhoId: g.tamanhoId!,
          qtdMultiplicadorGrade: g.qtdMultiplicadorGrade || 0,
        })) || [],
      }))

      await adicionarItensLote({ id, enfestos: payload });
    } finally {
      setIsSubmitting(false);
    }
  }, [adicionarItensLote]);


  const handleAdicionarRolos = useCallback(async (id: string, values: IRequestBodyAddRolosLote ) => {
    setIsSubmitting(true);
    try {
      const payload: IRequestBodyAddRolosLote = {
        rolosProducao: values.rolosProducao?.map(r => ({
          estoqueRoloId: r.estoqueRoloId!,
          pesoReservado: r.pesoReservado || 0,
        })) || [],
      };

      await adicionarRolosLote({ id, payload });
    } finally {
      setIsSubmitting(false);
    }
  }, [adicionarRolosLote]);

  /**
   * Transforma os dados para ATUALIZAÇÃO GERAL
   */


  const handleEditLoteCabeçalho = useCallback(async (id: string, values: IRequestBodyUpdateLote) => {

    setIsSubmitting(true);

    try {
      const payload: IRequestBodyUpdateLote = {
        codigoLote: values.codigoLote,
        responsavelId: values.responsavelId,
        status: values.status,
        observacao: values.observacao}
      await atualizarLote({ id, dados: payload });
    } finally {
      setIsSubmitting(false);
    }
  }, [atualizarLote]);


  const handleEditLote = useCallback(async (id: string, values?: IRequestBodyUpdateLote) => {
    setIsSubmitting(true);
    try {
      const payload: IRequestBodyUpdateLote = {
        codigoLote: values?.codigoLote,
        responsavelId: values?.responsavelId,
        status: values?.status,
        observacao: values?.observacao,
        gradeItens: values?.gradeItens?.map(g => ({
          produtoId: g.produtoId!,
          tamanhoId: g.tamanhoId!,
          qtdMultiplicadorGrade: g.qtdMultiplicadorGrade || 0,
        })) || [],
        enfestos: values?.enfestos?.flatMap(e =>
          ({
            qtdFolhas: e.qtdFolhas || 0,
            corId: e.corId!,
            rolosProducao: e.rolosProducao?.map(r => ({
              estoqueRoloId: r.estoqueRoloId!,
              pesoReservado: r.pesoReservado || 0
            })) || [],
          })) || []
      };

      await atualizarLote({ id, dados: payload });
    } finally {
      setIsSubmitting(false);
    }
  }, [atualizarLote]);

  return {
    handleCriarLote,
    handleAdicionarItens,
    handleAdicionarRolos,
    handleEditLoteCabeçalho,
    handleEditLote,
    isSubmitting,
  };
}