import { LLMError, type LLMProvider, type LLMRequest, type LLMResponse } from "./provider.types"

export type AnthropicProviderOptions = {
    apiKey: string
    /** Usa un proxy propio en producción: no expongas la clave en el navegador. */
    baseUrl?: string
    anthropicVersion?: string
    defaultMaxTokens?: number
    /** Solo para llamadas directas desde el navegador (desaconsejado). */
    browserDirectAccess?: boolean
    /** USD por millón de tokens; si se indica, se calcula `usage.costUsd`. */
    pricePerMTok?: { input: number; output: number }
    fetch?: typeof fetch
}

type MessagesResponse = {
    model?: string
    content?: Array<{ type: string; text?: string }>
    usage?: { input_tokens?: number; output_tokens?: number }
}

/** Proveedor para la Messages API de Anthropic (`POST /v1/messages`). */
export function createAnthropicProvider(options: AnthropicProviderOptions): LLMProvider {
    const baseUrl = (options.baseUrl ?? "https://api.anthropic.com").replace(/\/+$/, "")
    const doFetch = options.fetch ?? globalThis.fetch.bind(globalThis)

    return {
        id: "anthropic",
        simulated: false,
        async complete(request: LLMRequest): Promise<LLMResponse> {
            const headers: Record<string, string> = {
                "content-type": "application/json",
                "x-api-key": options.apiKey,
                "anthropic-version": options.anthropicVersion ?? "2023-06-01"
            }
            if (options.browserDirectAccess) headers["anthropic-dangerous-direct-browser-access"] = "true"

            const body: Record<string, unknown> = {
                model: request.model,
                max_tokens: request.maxTokens ?? options.defaultMaxTokens ?? 1024,
                messages: [{ role: "user", content: request.prompt }]
            }
            if (request.system) body.system = request.system
            if (request.temperature !== undefined) body.temperature = request.temperature

            const response = await doFetch(`${baseUrl}/v1/messages`, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                signal: request.signal
            })

            if (!response.ok) {
                const detail = (await response.text().catch(() => "")).slice(0, 300)
                const retryable = response.status === 408 || response.status === 429 || response.status >= 500
                throw new LLMError(`Anthropic ${response.status}: ${detail || response.statusText}`, {
                    status: response.status,
                    retryable
                })
            }

            const data = (await response.json()) as MessagesResponse
            const text = (data.content ?? [])
                .filter(block => block.type === "text" && typeof block.text === "string")
                .map(block => block.text)
                .join("")
            const inputTokens = data.usage?.input_tokens ?? 0
            const outputTokens = data.usage?.output_tokens ?? 0
            const price = options.pricePerMTok
            return {
                text,
                model: data.model ?? request.model,
                usage: {
                    inputTokens,
                    outputTokens,
                    costUsd: price ? (inputTokens * price.input + outputTokens * price.output) / 1_000_000 : undefined
                }
            }
        }
    }
}
