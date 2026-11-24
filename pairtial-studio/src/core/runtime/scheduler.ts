import type { PairtialNode, PairtialSystem } from "../types/types"
import { buildDependencies } from "../graph/loops"

export type SchedulerOptions = {
    maxConcurrency: number
    signal: AbortSignal
    abortPeers: () => void
    execute: (node: PairtialNode) => Promise<void>
    /**
     * Se llama (síncronamente) cuando `execute` termina bien, antes de dar el
     * nodo por resuelto. Si devuelve nodos, se vuelven a poner en cola — así se
     * implementan los bucles. Esos nodos deben ser ancestros (o el propio nodo).
     */
    afterExecute?: (node: PairtialNode) => PairtialNode[] | undefined
}

/** Scheduler con dependencias; los nodos omitidos también liberan a sus dependientes. */
export async function scheduleNodes(
    system: PairtialSystem,
    plan: PairtialNode[],
    options: SchedulerOptions
): Promise<void> {
    const { maxConcurrency, signal, abortPeers, execute, afterExecute } = options
    if (!Number.isInteger(maxConcurrency) || maxConcurrency < 1 || maxConcurrency > 64) {
        throw new Error("maxConcurrency must be an integer between 1 and 64")
    }
    const pending = new Map(plan.map(node => [node.id, node]))
    const settled = new Set<string>()
    const running = new Map<string, Promise<void>>()
    const dependencies = buildDependencies(system)
    let failed = false
    let firstError: unknown
    while (pending.size || running.size) {
        if (!failed && !signal.aborted) {
            for (const [id, node] of pending) {
                if (running.size >= maxConcurrency || failed || signal.aborted) break
                if (![...(dependencies.get(id) ?? [])].every(dep => settled.has(dep))) continue
                pending.delete(id)
                const task = Promise.resolve().then(() => {
                    signal.throwIfAborted()
                    return execute(node)
                }).then(() => {
                    const again = afterExecute?.(node)
                    if (again?.length) {
                        // Volver a poner en cola el cuerpo del bucle (incluido este nodo).
                        for (const n of again) {
                            settled.delete(n.id)
                            pending.set(n.id, n)
                        }
                        settled.delete(id)
                        pending.set(id, node)
                    } else {
                        settled.add(id)
                    }
                }).catch(error => {
                    if (!failed) {
                        failed = true
                        firstError = error
                        abortPeers()
                    }
                }).finally(() => { running.delete(id) })
                running.set(id, task)
            }
        }
        if (running.size) await Promise.race(running.values())
        else if (failed || signal.aborted) break
        else if (pending.size) throw new Error("Scheduler stalled: unresolved dependencies")
    }
    if (failed) throw firstError
    signal.throwIfAborted()
}
