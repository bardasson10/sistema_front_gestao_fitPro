import { useState, useCallback } from "react";
import { 
  useCriarLoteProducao, 
  useAdicionarItensLoteProducao, 
  useAtualizarLoteProducao,
  CriarLoteProducaoPayload,
  AtualizarLoteProducaoPayload,
  ApiLoteProducaoResponse,
  AdicionarItensLoteProducaoPayload,
  useAdicionarRolosLoteProducao,
  AdicionarRolosLoteProducaoPayload
} from "./queries/useProducao";

export function useProducaoActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: criarLote } = useCriarLoteProducao();
  const { mutateAsync: adicionarItensLote } = useAdicionarItensLoteProducao();
  const { mutateAsync: atualizarLote } = useAtualizarLoteProducao();
  const { mutateAsync: adicionarRolosLote } = useAdicionarRolosLoteProducao();

  /**
   * Transforma os dados brutos do formulário/interface no payload de CRIAÇÃO
   */
  const handleCriarLote = useCallback(async (values: CriarLoteProducaoPayload) => {
    setIsSubmitting(true);
    try {

      const payload: CriarLoteProducaoPayload = {
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
  const handleAdicionarItens = useCallback(async (id: string, values: AdicionarItensLoteProducaoPayload | AdicionarItensLoteProducaoPayload[]) => {
    setIsSubmitting(true);
    try {
      const valuesArray = Array.isArray(values) ? values : [values]

      const payload: AdicionarItensLoteProducaoPayload[] = valuesArray.map((value) => ({
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


  const handleAdicionarRolos = useCallback(async (id: string, values: AdicionarRolosLoteProducaoPayload ) => {
    setIsSubmitting(true);
    try {
      const payload: AdicionarRolosLoteProducaoPayload = {
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


  const handleEditLoteCabeçalho = useCallback(async (id: string, values: ApiLoteProducaoResponse) => {

    setIsSubmitting(true);

    try {
      const payload: AtualizarLoteProducaoPayload = {
        codigoLote: values.codigoLote,
        responsavelId: values.responsavel?.id,
        status: values.status,
        observacao: values.observacao}
      await atualizarLote({ id, dados: payload });
    } finally {
      setIsSubmitting(false);
    }
  }, [atualizarLote]);


  const handleEditLote = useCallback(async (id: string, values?: AtualizarLoteProducaoPayload) => {
    setIsSubmitting(true);
    try {
      const payload: AtualizarLoteProducaoPayload = {
        codigoLote: values?.codigoLote,
        responsavelId: values?.responsavelId,
        status: values?.status,
        observacao: values?.observacao,
        enfestos: values?.enfestos?.flatMap(e =>
          ({
            qtdFolhas: e.qtdFolhas || 0,
            corId: e.corId!,
            rolosProducao: e.rolosProducao?.map(r => ({
              estoqueRoloId: r.estoqueRoloId!,
              pesoReservado: r.pesoReservado || 0
            })) || [],
            itens: e.itens?.map(g => ({
              produtoId: g.produtoId!,
              tamanhoId: g.tamanhoId!,
              qtdMultiplicadorGrade: g.qtdMultiplicadorGrade || 0,
            })) || []
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