import type { Envelope } from "../envelope/envelope.types"
import type { ProviderRegistry } from "../llm/provider.types"
import type { RuntimeEvent } from "../runtime/runtime.types"
import type { PairtialNode, PairtialSystem } from "../types/types"


export type ExecutorContext = {
    runId: string
    system: PairtialSystem
    signal: AbortSignal
    mockDatabase: Map<string, unknown>
    providers: ProviderRegistry
    /** Fuente de azar inyectable (fallos simulados deterministas en tests). */
    random: () => number
    /** Número de ejecución de este nodo en el run (1, 2, … si está en un bucle). */
    iteration: number
    emit: (event: RuntimeEvent) => void
}


export type ExecutorInput = {
    node: PairtialNode

    inputs: Envelope[]

    context: ExecutorContext
}


export type NodeExecutor = (
    input: ExecutorInput
) => Promise<Envelope>
