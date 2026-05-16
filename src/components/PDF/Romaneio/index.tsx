"use client"

import { forwardRef, useMemo } from "react"
import logo from '../../../app/logo.png'
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { ApiLoteProducaoResponse } from "@/hooks/queries/useProducao"

type RomaneioProps = {
    lote?: ApiLoteProducaoResponse | null
    onPrint?: () => void
}

type SizeColumn = {
    key: string
    label: string
    order: number
}

type ProductRow = {
    produtoId: string
    produtoNome: string
    sku: string
    quantities: Record<string, number>
    total: number
}

type ColorSection = {
    materialNome: string
    corNome: string
    corHex: string
    rolos: number
    folhas: number
    rows: ProductRow[]
}

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString("pt-BR") : "-")

const normalizeText = (value?: string) => (value && value.trim() ? value.trim() : "-")

const getSizeOrder = (label?: string, order?: number) => {
    if (typeof order === "number") return order

    const normalized = (label || "").trim().toUpperCase()
    const knownOrder: Record<string, number> = {
        PP: 1,
        P: 2,
        M: 3,
        G: 4,
        GG: 5,
        XG: 6,
        XGG: 7,
        EXG: 6,
        EXGG: 7,
    }

    return knownOrder[normalized] ?? 100
}

const RomaneioDeCorte = forwardRef<HTMLDivElement, RomaneioProps>(function RomaneioDeCorte({ lote, onPrint }, ref) {
    const report = useMemo(() => {
        const materials = lote?.materiais ?? []
        const sizeRegistry = new Map<string, SizeColumn>()
        const sections: ColorSection[] = []

        materials.forEach((material) => {
            const colors = material.cores ?? []

            if (colors.length === 0) {
                sections.push({
                    materialNome: normalizeText(material.nome || material.tecidoId),
                    corNome: "Sem cor",
                    corHex: "",
                    rolos: 0,
                    folhas: 0,
                    rows: [],
                })
                return
            }

            colors.forEach((color) => {
                const productMap = new Map<string, ProductRow>()

                    ; (color.gradeLote || []).forEach((grade) => {
                        const sizeKey = grade.tamanhoId || grade.tamanho?.id || grade.tamanhoNome || `size-${productMap.size}`
                        const sizeLabel = normalizeText(grade.tamanhoNome || grade.tamanho?.nome || sizeKey)
                        const sizeOrder = getSizeOrder(sizeLabel, grade.tamanho?.ordem)

                        if (!sizeRegistry.has(sizeKey)) {
                            sizeRegistry.set(sizeKey, {
                                key: sizeKey,
                                label: sizeLabel,
                                order: sizeOrder,
                            })
                        }

                        const productKey = grade.produtoId || grade.produto?.id || grade.produtoNome || grade.sku || `product-${productMap.size}`
                        const quantidade = Number(grade.quantidadePlanejada ?? grade.qtdMultiplicadorGrade ?? 0)

                        const currentRow = productMap.get(productKey) || {
                            produtoId: productKey,
                            produtoNome: normalizeText(grade.produtoNome || grade.produto?.nome),
                            sku: normalizeText(grade.sku || grade.produto?.sku),
                            quantities: {},
                            total: 0,
                        }

                        currentRow.quantities[sizeKey] = (currentRow.quantities[sizeKey] || 0) + quantidade
                        currentRow.total += quantidade

                        if (currentRow.produtoNome === "-") {
                            currentRow.produtoNome = normalizeText(grade.produtoNome || grade.produto?.nome)
                        }

                        if (currentRow.sku === "-") {
                            currentRow.sku = normalizeText(grade.sku || grade.produto?.sku)
                        }

                        productMap.set(productKey, currentRow)
                    })

                sections.push({
                    materialNome: normalizeText(material.nome || material.tecidoId),
                    corNome: normalizeText(color.nome || color.corId),
                    corHex: color.codigoHex || "",
                    rolos: (color.rolos || []).length,
                    folhas: Number(color.qtdFolhas || 0),
                    rows: Array.from(productMap.values()).sort((a, b) => a.produtoNome.localeCompare(b.produtoNome)),
                })
            })
        })

        const sizeColumns = Array.from(sizeRegistry.values()).sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))

        return {
            header: {
                dataEnfest: formatDate(lote?.createdAt),
                dataCorte: formatDate(lote?.updatedAt || lote?.createdAt),
                lote: normalizeText(lote?.codigoLote),
                responsavel: normalizeText(lote?.responsavel?.nome),
                status: normalizeText(lote?.status),
                observacao: normalizeText(lote?.observacao),
            },
            sizeColumns,
            sections,
        }
    }, [lote])

    const handlePrint = () => {
        if (onPrint) {
            onPrint()
            return
        }

        window.print()
    }

    const materialGroups = useMemo(() => {
        const map = new Map<string, ColorSection[]>()
        report.sections.forEach((s) => {
            const key = s.materialNome || 'Sem tecido'
            if (!map.has(key)) map.set(key, [])
            map.get(key)!.push(s)
        })
        return Array.from(map.entries()).map(([materialNome, colors]) => ({ materialNome, colors }))
    }, [report])

    const totalPieces = useMemo(() => {
        return report.sections.reduce((acc, s) => acc + s.rows.reduce((rAcc, row) => rAcc + (row.total || 0), 0), 0)
    }, [report])

    return (
        <div ref={ref} className="romaneio-print-wrapper">
            <style>{`
                @page { size: A4; margin: 12mm; }
                .romaneio-print-wrapper { width: 100%; }
                .romaneio-page { box-sizing: border-box; width: 210mm; min-height: 297mm; margin: 0 auto; padding: 8mm; }
                .romaneio-page .card { background: white; }
                .no-break { page-break-inside: avoid; break-inside: avoid; }
                @media print {
                    body { -webkit-print-color-adjust: exact; }
                    .romaneio-page { box-shadow: none !important; border: none !important; }
                    .print\:hidden { display: none !important; }
                    table { page-break-inside: auto; }
                    tr { page-break-inside: avoid; break-inside: avoid; }
                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }
                    /* Hide everything except the romaneio wrapper when printing */
                    body * { visibility: hidden; }
                    .romaneio-print-wrapper, .romaneio-print-wrapper * { visibility: visible; }
                    .romaneio-print-wrapper { position: absolute; left: 0; top: 0; }
                }
            `}</style>

            <div className="romaneio-page mx-auto w-full max-w-6xl rounded-xl border bg-card shadow-sm print:max-w-none print:border-0 print:shadow-none">
                <div className="flex items-center justify-between gap-3 border-b p-4 print:hidden">
                    <Button onClick={handlePrint} variant="outline" size="sm">
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
                    </Button>
                </div>

                <div className="border-b p-4">
                    <div className="grid gap-4">
                        <div className="rounded-lg border p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold">{report.header.lote}</h1>
                                </div>

                                <div className="flex items-center gap-3">
                                    <img src={typeof logo === 'string' ? logo : (logo as any).src} alt="Logo da empresa" className="h-12 w-12 object-contain rounded" loading="eager" />
                                    <div className="rounded-full border px-3 py-1 text-sm font-medium capitalize">
                                        {report.header.status.replaceAll("_", " ")}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <InfoBlock label="Data do Enfesto" value={report.header.dataEnfest} />
                                <InfoBlock label="Data da Corte" value={report.header.dataCorte} />
                                <InfoBlock label="Responsável" value={report.header.responsavel} />
                                <InfoBlock label="Assinatura" value="_____________________________________" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 p-4 md:p-6">
                    {report.sections.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                            Nenhum dado disponível para montar o romaneio deste lote.
                        </div>
                    ) : (
                        <>
                            {/* Enfesto summary: tecido -> cores with rolos/folhas */}
                            <div className="rounded-lg border p-6">
                                <h2 className="text-lg font-semibold mb-3">Enfesto</h2>
                                {materialGroups.map((mat) => (
                                    <div key={mat.materialNome} className="mb-4">
                                        <h3 className="font-medium">{mat.materialNome}</h3>
                                        <div className="grid gap-4 sm:grid-cols-3 mt-2">
                                            {mat.colors.map((c) => (
                                                <div key={`${mat.materialNome}-${c.corNome}`} className="rounded-lg border p-4">
                                                    <p className="font-medium">{c.corNome}</p>
                                                    <p className="text-sm text-muted-foreground">Rolos: {c.rolos} · Folhas: {c.folhas}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Grades by material and color */}
                            {materialGroups.map((mat) => (
                                <div key={`grades-${mat.materialNome}`} className="space-y-4">
                                    <h3 className="text-lg font-semibold">Grade — {mat.materialNome}</h3>
                                        {mat.colors.map((section, index) => (
                                        <section key={`${section.materialNome}-${section.corNome}-${index}`} className="rounded-xl border no-break p-4">
                                            <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/40 p-4">
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Cor</p>
                                                    <h4 className="text-lg font-semibold">{section.corNome}</h4>
                                                </div>

                                                <div className="flex flex-wrap gap-2 text-sm">
                                                    <StatPill label="Rolos" value={section.rolos} />
                                                    <StatPill label="Folhas" value={section.folhas} />
                                                    <StatPill label="Produtos" value={section.rows.length} />
                                                </div>
                                            </div>

                                            <div className="overflow-x-auto px-4">
                                                <table className="w-full border-collapse text-xs">
                                                    <thead>
                                                        <tr className="border-b bg-foreground text-background">
                                                            <th className="min-w-30 px-2 py-1 text-left font-semibold text-xs">Produto</th>
                                                            <th className="min-w-20 px-2 py-1 text-left font-semibold text-xs">SKU</th>
                                                            {report.sizeColumns.map((size) => (
                                                                <th key={size.key} className="min-w-10 px-2 py-1 text-center font-semibold text-xs">
                                                                    {size.label}
                                                                </th>
                                                            ))}
                                                            <th className="min-w-15 px-2 py-1 text-center font-semibold text-xs">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {section.rows.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={4 + report.sizeColumns.length} className="px-3 py-4 text-center text-muted-foreground">
                                                                    Nenhum produto encontrado para esta cor.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            section.rows.map((row) => (
                                                                <tr key={row.produtoId} className="border-b last:border-b-0">
                                                                    <td className="px-2 py-1 font-medium text-xs">{row.produtoNome}</td>
                                                                    <td className="px-2 py-1 text-muted-foreground text-xs">{row.sku}</td>
                                                                    {report.sizeColumns.map((size) => (
                                                                        <td key={`${row.produtoId}-${size.key}`} className="px-2 py-1 text-center text-xs">
                                                                            {row.quantities[size.key] || "-"}
                                                                        </td>
                                                                    ))}
                                                                    <td className="px-2 py-1 text-center font-semibold text-xs">{row.total || "-"}</td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            ))}

                            {/* Total pieces */}
                            <div className="rounded-lg border p-4">
                                <p className="text-sm font-medium">Total de peças cortadas</p>
                                <p className="mt-2 text-2xl font-bold">{totalPieces}</p>
                            </div>
                        </>
                    )}
                </div>

                <div className="border-t p-4">
                    <p className="text-sm font-medium">Observações</p>
                    <p className="mt-2 min-h-16 rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
                        {report.header.observacao || "Sem observações."}
                    </p>
                </div>
            </div>
        </div>
    )
})

export default RomaneioDeCorte

function InfoBlock({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border bg-background p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-medium">{value}</p>
        </div>
    )
}

function StatPill({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-full border bg-background px-3 py-1 text-xs font-medium">
            <span className="text-muted-foreground">{label}:</span> <span>{value}</span>
        </div>
    )
}
