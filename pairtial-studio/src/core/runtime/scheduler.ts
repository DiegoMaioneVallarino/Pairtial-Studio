import type { PairtialNode, PairtialSystem } from "../types/types"

/** Dependency-aware scheduler; skipped nodes also settle their dependencies. */
export async function scheduleNodes(
    system: PairtialSystem,
    plan: PairtialNode[],
    maxConcurrency: number,
    signal: AbortSignal,
    abortPeers: () => void,
    execute: (node: PairtialNode, suspend: <T>(promise: Promise<T>) => Promise<T>) => Promise<void>
): Promise<void> {
    if (!Number.isInteger(maxConcurrency) || maxConcurrency < 1 || maxConcurrency > 64) {
        throw new Error("maxConcurrency must be an integer between 1 and 64")
    }
    const pending = new Map(plan.map(node => [node.id, node]))
    const settled = new Set<string>()
    const running = new Map<string, Promise<void>>()
    const dependencies = new Map(plan.map(node => [node.id, new Set<string>()]))
    for (const edge of system.edges) dependencies.get(edge.targetNodeId)?.add(edge.sourceNodeId)
    const suspended = new Set<string>()
    let wake: () => void = () => {}
    const notify = () => wake()
    let failed = false
    let firstError: unknown
    while (pending.size || running.size) {
        if (!failed && !signal.aborted) {
            for (const [id, node] of pending) {
                if (running.size - suspended.size >= maxConcurrency || failed || signal.aborted) break
                if (![...dependencies.get(id)!].every(dep => settled.has(dep))) continue
                pending.delete(id)
                const task = Promise.resolve().then(() => {
                    signal.throwIfAborted()
                    return execute(node, async promise => {
                        suspended.add(id); notify()
                        try { return await promise } finally { suspended.delete(id); notify() }
                    })
                }).then(() => { settled.add(id) }).catch(error => {
                    if (!failed) {
                        failed = true
                        firstError = error
                        abortPeers()
                    }
                }).finally(() => { running.delete(id); notify() })
                running.set(id, task)
            }
        }
        if (running.size) await Promise.race([...running.values(), new Promise<void>(resolve => {wake=resolve})])
        else if (failed || signal.aborted) break
        else if (pending.size) throw new Error("Scheduler stalled: unresolved dependencies")
    }
    if (failed) throw firstError
    signal.throwIfAborted()
}
