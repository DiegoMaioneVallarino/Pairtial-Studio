import type { FeedbackConfig, PairtialEdge, PairtialSystem } from "../types/types"

export const DEFAULT_MAX_ITERATIONS = 3
export const MAX_ITERATIONS_LIMIT = 50

export const DEFAULT_FEEDBACK: FeedbackConfig = {
    maxIterations: DEFAULT_MAX_ITERATIONS,
    onExhausted: "fail"
}

export type LoopInfo = {
    edge: PairtialEdge
    feedback: FeedbackConfig
    /** Nodos que se re-ejecutan en cada vuelta: descendientes del destino ∩ ancestros del origen. */
    bodyNodeIds: Set<string>
}

type EdgeLike = Pick<PairtialEdge, "sourceNodeId" | "targetNodeId" | "feedback">

export function forwardEdgesOf<E extends EdgeLike>(edges: E[]): E[] {
    return edges.filter(edge => !edge.feedback)
}

function adjacency(edges: EdgeLike[], reverse: boolean): Map<string, string[]> {
    const map = new Map<string, string[]>()
    for (const edge of edges) {
        const from = reverse ? edge.targetNodeId : edge.sourceNodeId
        const to = reverse ? edge.sourceNodeId : edge.targetNodeId
        const list = map.get(from)
        if (list) list.push(to)
        else map.set(from, [to])
    }
    return map
}

/** Nodos alcanzables desde `start` (incluido). */
function reachable(start: string, adj: Map<string, string[]>): Set<string> {
    const seen = new Set<string>([start])
    const stack = [start]
    while (stack.length) {
        const current = stack.pop()!
        for (const next of adj.get(current) ?? []) {
            if (!seen.has(next)) {
                seen.add(next)
                stack.push(next)
            }
        }
    }
    return seen
}

/**
 * ¿Conectar source → target cerraría un ciclo en el grafo "hacia delante"?
 * Si es así, la UI debería crear la arista como retroalimentación.
 */
export function wouldCreateCycle(edges: EdgeLike[], source: string, target: string): boolean {
    if (source === target) return true
    return reachable(target, adjacency(forwardEdgesOf(edges), false)).has(source)
}

export function analyzeLoops(system: PairtialSystem): LoopInfo[] {
    const forward = forwardEdgesOf(system.edges)
    const down = adjacency(forward, false)
    const up = adjacency(forward, true)
    const loops: LoopInfo[] = []
    for (const edge of system.edges) {
        if (!edge.feedback) continue
        const descendants = reachable(edge.targetNodeId, down)
        const ancestors = reachable(edge.sourceNodeId, up)
        const body = new Set([...descendants].filter(id => ancestors.has(id)))
        loops.push({ edge, feedback: edge.feedback, bodyNodeIds: body })
    }
    return loops
}

/**
 * Dependencias del scheduler: aristas hacia delante, más una por cada nodo
 * externo al cuerpo de un bucle que consume salidas del cuerpo — espera a que
 * el bucle termine (al origen de la retroalimentación) para no leer una
 * iteración intermedia.
 */
export function buildDependencies(system: PairtialSystem): Map<string, Set<string>> {
    const dependencies = new Map<string, Set<string>>(
        system.nodes.map(node => [node.id, new Set<string>()])
    )
    const forward = forwardEdgesOf(system.edges)
    for (const edge of forward) dependencies.get(edge.targetNodeId)?.add(edge.sourceNodeId)

    for (const loop of analyzeLoops(system)) {
        for (const edge of forward) {
            if (loop.bodyNodeIds.has(edge.sourceNodeId) && !loop.bodyNodeIds.has(edge.targetNodeId)) {
                dependencies.get(edge.targetNodeId)?.add(loop.edge.sourceNodeId)
            }
        }
    }
    return dependencies
}
