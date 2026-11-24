export type LLMRequest = {
    model: string
    system?: string
    prompt: string
    temperature?: number
    maxTokens?: number
    signal?: AbortSignal
    /** Número de ejecución del nodo (1, 2, … en bucles). */
    iteration?: number
    /** Texto que devolverá un proveedor simulado. Los proveedores reales lo ignoran. */
    mockResponse?: string
}

export type LLMUsage = {
    inputTokens: number
    outputTokens: number
    costUsd?: number
}

export type LLMResponse = {
    text: string
    usage?: LLMUsage
    model?: string
}

export interface LLMProvider {
    readonly id: string
    /** true si no hace llamadas reales: el runtime le aplica latencia/fallos simulados. */
    readonly simulated: boolean
    complete(request: LLMRequest): Promise<LLMResponse>
}

/** Error de proveedor. `retryable: false` evita reintentos inútiles (401, 400…). */
export class LLMError extends Error {
    readonly status?: number
    readonly retryable: boolean

    constructor(message: string, options: { status?: number; retryable?: boolean } = {}) {
        super(message)
        this.name = "LLMError"
        this.status = options.status
        this.retryable = options.retryable ?? true
    }
}

export type ProviderRegistry = {
    get(id: string): LLMProvider
    ids(): string[]
}
