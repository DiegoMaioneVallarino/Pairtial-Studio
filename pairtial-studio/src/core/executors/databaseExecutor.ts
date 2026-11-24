import { createEnvelope } from "../envelope/createEnvelope"
import { abortableDelay } from "../runtime/abortableDelay"
import type { NodeExecutor } from "./executor.types"

export const databaseExecutor: NodeExecutor = async ({ node, inputs, context }) => {
    const started = performance.now()
    await abortableDelay(300, context.signal)
    const db = context.mockDatabase
    const operation = String(node.config.operation ?? "write")
    const key = String(node.config.key ?? "result")
    const value = node.config.value !== undefined && node.config.value !== ""
        ? node.config.value : inputs.map(e => e.payload)
    let result: unknown
    switch (operation) {
        case "write": db.set(key, value); result = value; break
        case "update":
            if (!db.has(key)) throw new Error(`Missing database key: ${key}`)
            db.set(key, value); result = value; break
        case "read": result = db.get(key) ?? null; break
        case "delete": result = db.delete(key); break
        case "search": result = Array.from(db.entries()).filter(([k]) => k.includes(key)); break
        default: throw new Error(`Unknown database operation: ${operation}`)
    }
    return createEnvelope({ sourceNodeId: node.id, payload: { type: "database", operation, key, result, size: db.size, simulated: true }, metadata: { mimeType: "application/json", durationMs: performance.now() - started } })
}
