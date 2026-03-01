// // utils/mappers/mapLoteProducao.ts

// import {
//   Enfesto,
//   GradeLote,
//   LoteFormData,
//   RoloProducao
// } from "@/components/Forms/LoteProducao/interface-lote-form"

// import { ApiLoteProducaoResponse } from "@/hooks/queries/useProducao"

// const buildGradeKey = (produtoId?: string, tamanhoId?: string) =>
//   `${produtoId ?? ""}::${tamanhoId ?? ""}`

// export function mapApiLoteToForm(
//   api: ApiLoteProducaoResponse
// ): LoteFormData {

//   const enfestosFromMateriais: Enfesto[] =
//     api.materiais?.flatMap((material) =>
//       material.cores?.map((cor) => {
//         const grade: GradeLote = {}
//         cor.gradeLote?.forEach((item) => {
//           if (!item.produtoId || !item.tamanhoId) return
//           const key = buildGradeKey(item.produtoId, item.tamanhoId)
//           grade[key] = item.quantidadePlanejada ?? 0
//         })
//         const produtosSelecionados = [
//           ...new Set(
//             cor.gradeLote
//               ?.map((g) => g.produtoId)
//               .filter(Boolean) as string[]
//           ),
//         ]
//         const rolosProducao: RoloProducao[] =
//           cor.rolos?.map((rolo) => ({
//             estoqueRoloId: rolo.id,
//             pesoReservado: rolo.pesoReservado ?? 0,
//           })) ?? []
//         return {
//           corId: cor.corId ?? "",
//           qtdFolhas: cor.qtdFolhas ?? 0,
//           rolosProducao,
//           produtosSelecionados,
//           gradeLote: grade,
//         }
//       }) ?? []
//     ) ?? []

//   const enfestosFromApi: Enfesto[] =
//     api.enfestos?.map((e) => ({
//       corId: e.cor,
//       qtdFolhas: e.qtdFolhas,
//       rolosProducao: e.rolos.map((r) => ({
//         estoqueRoloId: r.estoqueRoloId,
//         pesoReservado: 0,
//       })),
//       produtosSelecionados: [],
//       gradeLote: [],
//     })) ?? []

//   return {
//     loteId: api.id,
//     codigoLote: api.codigoLote,
//     status: api.status,
//     observacao: api.observacao ?? "",
//     enfestos:
//       enfestosFromMateriais.length > 0
//         ? enfestosFromMateriais
//         : enfestosFromApi,
//   }
// }