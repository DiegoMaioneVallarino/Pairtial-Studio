import { createEnvelope } from "../envelope/createEnvelope"
import { buildJudgePrompt, describePayload, parseJudgement, primaryInputs, primaryText } from "../llm/prompts"
import type { Envelope } from "../envelope/envelope.types"
import type { NodeExecutor } from "./executor.types"

type Check = { name: string; passed: boolean }

function terms(value: unknown): string[] {
    return String(value ?? "").split(",").map(term => term.trim().toLowerCase()).filter(Boolean)
}

/** Evaluación determinista del texto de entrada: % de comprobaciones superadas. */
export function heuristicChecks(text: string, config: Record<string, unknown>): Check[] {
    const lower = text.toLowerCase()
    const checks: Check[] = [{ name: "no vacío", passed: text.trim().length > 0 }]
    const minLength = Number(config.minLength)
    if (minLength > 0) checks.push({ name: `longitud ≥ ${minLength}`, passed: text.trim().length >= minLength })
    for (const term of terms(config.mustInclude)) checks.push({ name: `incluye "${term}"`, passed: lower.includes(term) })
    for (const term of terms(config.mustNotInclude)) checks.push({ name: `no incluye "${term}"`, passed: !lower.includes(term) })
    return checks
}

export const qualityExecutor: NodeExecutor = async ({ node, inputs, context }) => {
    const config = node.config
    const mode = String(config.mode)
    const threshold = Number(config.threshold)

    let score: number
    let reason = ""
    let checks: Check[] | undefined
    let tokens: number | undefined
    let cost: number | undefined

    if (mode === "heuristic") {
        checks = heuristicChecks(primaryText(inputs), config)
        score = Math.round((100 * checks.filter(check => check.passed).length) / checks.length)
        reason = checks.filter(check => !check.passed).map(check => `falla: ${check.name}`).join("; ") || "todas las comprobaciones superadas"
    } else if (mode === "llm") {
        const provider = context.providers.get(String(config.provider))
        const reference = inputs.filter((envelope: Envelope) => envelope.targetPortId === "context" && !envelope.feedback)
            .map(envelope => describePayload(envelope.payload)).join("\n\n")
        const subject = primaryText(inputs)
        const response = await provider.complete({
            model: String(config.model),
            prompt: buildJudgePrompt(String(config.criteria), subject, reference),
            temperature: 0,
            maxTokens: 300,
            signal: context.signal,
            iteration: context.iteration,
            mockResponse: JSON.stringify({ score: Number(config.score), reason: "Evaluación simulada" })
        })
        const judgement = parseJudgement(response.text)
        score = judgement.score
        reason = judgement.reason
        if (response.usage) {
            tokens = response.usage.inputTokens + response.usage.outputTokens
            cost = response.usage.costUsd
        }
    } else {
        // "manual": puntuación fija configurada (comportamiento original).
        score = Number(config.score)
        reason = "Puntuación manual"
    }

    return createEnvelope({
        sourceNodeId: node.id,
        payload: {
            passed: score >= threshold,
            mode,
            criteria: config.criteria,
            threshold: threshold / 100,
            score: score / 100,
            reason,
            checks,
            evaluated: primaryInputs(inputs).map(envelope => ({ sourceNodeId: envelope.sourceNodeId, edgeId: envelope.edgeId }))
        },
        metadata: { mimeType: "application/json", tokens, cost }
    })
}
