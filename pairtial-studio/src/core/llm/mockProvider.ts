import type { LLMProvider, LLMRequest, LLMResponse } from "./provider.types"

export type MockResponder = (request: LLMRequest) => string | Promise<string>

/**
 * Proveedor simulado y determinista. Devuelve `request.mockResponse`, o lo que
 * produzca `responder` (útil en tests para guionizar varias vueltas).
 */
export function createMockProvider(responder?: MockResponder): LLMProvider {
    return {
        id: "mock",
        simulated: true,
        async complete(request: LLMRequest): Promise<LLMResponse> {
            request.signal?.throwIfAborted()
            const text = request.mockResponse ?? (responder ? await responder(request) : "Respuesta simulada")
            return { text, model: request.model }
        }
    }
}
