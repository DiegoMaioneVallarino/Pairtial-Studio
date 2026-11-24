import { createMockProvider } from "./mockProvider"
import type { LLMProvider, ProviderRegistry } from "./provider.types"

export function createProviderRegistry(providers: LLMProvider[]): ProviderRegistry {
    const map = new Map(providers.map(provider => [provider.id, provider]))
    return {
        get(id) {
            const provider = map.get(id)
            if (!provider) {
                const known = [...map.keys()].join(", ") || "ninguno"
                throw Object.assign(new Error(`Proveedor LLM "${id}" no configurado (disponibles: ${known})`), {
                    retryable: false
                })
            }
            return provider
        },
        ids: () => [...map.keys()]
    }
}

/** Registro por defecto: solo el proveedor simulado (sin red ni claves). */
export function defaultProviders(): ProviderRegistry {
    return createProviderRegistry([createMockProvider()])
}
