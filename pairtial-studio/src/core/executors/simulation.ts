import { getConfig } from "../config/nodeConfig"
import { abortableDelay } from "../runtime/abortableDelay"
import type { NodeKind } from "../types/types"
import type { NodeExecutor } from "./executor.types"

export type SimulationPredicate = (kind: NodeKind, config: Record<string, unknown>) => boolean

/**
 * Normaliza la configuración y, solo si el nodo está simulado, aplica latencia,
 * fallos aleatorios y tokens/coste ficticios. Los nodos "reales" (p. ej. un
 * Agent con un proveedor LLM de verdad) no reciben nada artificial.
 */
export function withSimulation(executor: NodeExecutor, isSimulated: SimulationPredicate): NodeExecutor {
    return async input => {
        const config = getConfig(input.node.kind, input.node.config)
        const simulated = isSimulated(input.node.kind, config)
        const started = performance.now()

        if (simulated) {
            await abortableDelay(Number(config.latencyMs), input.context.signal)
            if (input.context.random() * 100 < Number(config.failureRate)) {
                throw new Error("Fallo simulado configurado")
            }
        }

        const output = await executor({ ...input, node: { ...input.node, config } })
        input.context.signal.throwIfAborted()

        const metadata = { ...output.metadata, durationMs: performance.now() - started }
        if (simulated) {
            metadata.tokens ??= Math.min(Number(config.simulatedTokens), Number(config.maxTokens ?? Infinity))
            metadata.cost ??= Number(config.simulatedCost)
        }
        return { ...output, metadata }
    }
}
