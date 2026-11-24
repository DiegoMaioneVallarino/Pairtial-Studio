import type { PairtialNode, PairtialSystem } from "../types/types"
import { buildDependencies } from "./loops"

/**
 * Orden topológico sobre las aristas hacia delante (las de retroalimentación
 * no cuentan). Lanza si hay un ciclo sin marcar como retroalimentación.
 */
export function createExecutionPlan(system: PairtialSystem): PairtialNode[] {
    const dependencies = buildDependencies(system)
    const remaining = new Map<string, number>()
    const dependents = new Map<string, string[]>()
    for (const node of system.nodes) {
        remaining.set(node.id, dependencies.get(node.id)?.size ?? 0)
        dependents.set(node.id, [])
    }
    for (const [id, deps] of dependencies) {
        for (const dep of deps) dependents.get(dep)?.push(id)
    }

    const byId = new Map(system.nodes.map(node => [node.id, node]))
    const queue = system.nodes.filter(node => remaining.get(node.id) === 0).map(node => node.id)
    const result: PairtialNode[] = []

    for (let i = 0; i < queue.length; i++) {
        const id = queue[i]
        const node = byId.get(id)
        if (!node) continue
        result.push(node)
        for (const next of dependents.get(id) ?? []) {
            const count = (remaining.get(next) ?? 0) - 1
            remaining.set(next, count)
            if (count === 0) queue.push(next)
        }
    }

    if (result.length !== system.nodes.length) {
        throw new Error(
            "System contains a cycle or an invalid dependency graph (use a feedback edge for loops)"
        )
    }
    return result
}
