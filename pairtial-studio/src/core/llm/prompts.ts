import type { Envelope } from "../envelope/envelope.types"

const MAX_CHARS = 8000

/** Texto legible de un payload: cadenas tal cual, `{text}` → text, resto como JSON. */
export function describePayload(payload: unknown): string {
    if (payload === null || payload === undefined) return ""
    if (typeof payload === "string") return payload
    if (typeof payload === "object" && "text" in payload && typeof payload.text === "string") return payload.text
    if (typeof payload === "object" && "passed" in payload && typeof payload.passed === "boolean" && "reason" in payload) {
        // Veredicto de Quality: frase legible en lugar de JSON crudo.
        const score = "score" in payload && typeof payload.score === "number" ? ` (puntuación ${Math.round(payload.score * 100)}/100)` : ""
        return `Revisión: ${payload.passed ? "aprobado" : "rechazado"}${score}. ${String(payload.reason)}`.trim()
    }
    let json: string
    try {
        json = JSON.stringify(payload, null, 2)
    } catch {
        json = String(payload)
    }
    return json.length > MAX_CHARS ? `${json.slice(0, MAX_CHARS)}…[truncado]` : json
}

function isContext(envelope: Envelope) {
    return envelope.targetPortId === "context"
}

/** Entradas "principales": ni de contexto ni de retroalimentación. */
export function primaryInputs(inputs: Envelope[]): Envelope[] {
    return inputs.filter(envelope => !envelope.feedback && !isContext(envelope))
}

export function primaryText(inputs: Envelope[]): string {
    return primaryInputs(inputs).map(envelope => describePayload(envelope.payload)).filter(Boolean).join("\n\n")
}

function section(title: string, envelopes: Envelope[]): string {
    const body = envelopes.map(envelope => describePayload(envelope.payload)).filter(Boolean).join("\n\n")
    return body ? `## ${title}\n${body}` : ""
}

export function buildAgentPrompt(config: Record<string, unknown>, inputs: Envelope[]): string {
    const feedback = inputs.filter(envelope => envelope.feedback)
    const rest = inputs.filter(envelope => !envelope.feedback)
    return [
        String(config.prompt ?? "").trim(),
        section("Entrada", rest.filter(envelope => !isContext(envelope))),
        section("Contexto", rest.filter(isContext)),
        feedback.length
            ? section("Retroalimentación de la iteración anterior (corrige tu respuesta teniéndola en cuenta)", feedback)
            : ""
    ].filter(Boolean).join("\n\n")
}

export function buildJudgePrompt(criteria: string, subject: string, reference: string): string {
    return [
        "Eres un revisor de calidad estricto. Evalúa el TEXTO según los CRITERIOS.",
        `## Criterios\n${criteria || "Claridad y precisión"}`,
        reference ? `## Referencia\n${reference}` : "",
        `## Texto\n${subject}`,
        'Responde SOLO con JSON válido: {"score": <número 0-100>, "reason": "<una frase>"}'
    ].filter(Boolean).join("\n\n")
}

export type Judgement = { score: number; reason: string }

/** Extrae `{score, reason}` de la respuesta del juez; lanza si no es utilizable. */
export function parseJudgement(text: string): Judgement {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw Object.assign(new Error("Respuesta del juez sin JSON"), { retryable: true })
    let data: unknown
    try {
        data = JSON.parse(match[0])
    } catch {
        throw new Error("Respuesta del juez con JSON inválido")
    }
    const score = typeof data === "object" && data !== null && "score" in data ? Number(data.score) : NaN
    if (!Number.isFinite(score)) throw new Error("Respuesta del juez sin puntuación numérica")
    const reason = typeof data === "object" && data !== null && "reason" in data ? String(data.reason) : ""
    return { score: Math.min(100, Math.max(0, score)), reason }
}
