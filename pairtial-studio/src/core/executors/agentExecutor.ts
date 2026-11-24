import { createEnvelope } from "../envelope/createEnvelope"
import { LLMError } from "../llm/provider.types"
import { buildAgentPrompt } from "../llm/prompts"
import type { NodeExecutor } from "./executor.types"

export const agentExecutor: NodeExecutor = async ({ node, inputs, context }) => {
    const config = node.config
    const provider = context.providers.get(String(config.provider ?? "mock"))
    const prompt = buildAgentPrompt(config, inputs)

    if (!provider.simulated && !prompt.trim()) {
        throw new LLMError(`El agente "${node.name}" no tiene prompt ni entradas`, { retryable: false })
    }

    const iterationSuffix = context.iteration > 1 ? ` (iteración ${context.iteration})` : ""
    const response = await provider.complete({
        model: String(config.model),
        prompt,
        temperature: Number(config.temperature),
        maxTokens: Number(config.maxTokens),
        signal: context.signal,
        iteration: context.iteration,
        mockResponse: String(config.response || `Respuesta simulada de ${node.name}${iterationSuffix}`)
    })

    return createEnvelope({
        sourceNodeId: node.id,
        payload: {
            type: "text",
            text: response.text,
            prompt: config.prompt,
            provider: provider.id,
            model: response.model ?? config.model,
            temperature: config.temperature,
            // Referencias, no copias: evita que los payloads crezcan en cadena.
            sources: inputs.map(envelope => ({
                sourceNodeId: envelope.sourceNodeId,
                edgeId: envelope.edgeId,
                feedback: envelope.feedback ?? false
            }))
        },
        metadata: {
            mimeType: "application/json",
            tokens: response.usage ? response.usage.inputTokens + response.usage.outputTokens : undefined,
            cost: response.usage?.costUsd
        }
    })
}
