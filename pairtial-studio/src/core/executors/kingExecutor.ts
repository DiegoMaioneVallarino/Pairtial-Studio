import { createEnvelope } from "../envelope/createEnvelope"
import { abortableDelay } from "../runtime/abortableDelay"
import type { NodeExecutor } from "./executor.types"

export const kingExecutor: NodeExecutor = async ({ node, inputs, context }) => {
    const started = performance.now()
    await abortableDelay(600, context.signal)
    const decision = String(node.config.decision ?? "approve")
    if (!["approve", "revise", "reject"].includes(decision)) throw new Error("Invalid King decision")
    return createEnvelope({ sourceNodeId: node.id, payload: { type: "orchestration", simulated: true, objective: String(node.config.objective ?? "Evaluar resultados"), decision, instruction: decision === "approve" ? "Continuar" : decision === "revise" ? "Revisar resultados" : "Rechazar resultados", received: inputs.map(e => ({ sourceNodeId: e.sourceNodeId, payload: e.payload })) }, metadata: { mimeType: "application/json", durationMs: performance.now() - started } })
}
