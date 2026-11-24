export type NodeKind =
    | "db"
    | "agent"
    | "api"
    | "fabric"
    | "best-of-two"
    | "loop"
    | "deferred"
    | "quality"
    | "king"
    | "engineer"
    | "supervisor"
    | "hr"


export type Position = {
    x: number
    y: number
}


export type PairtialNode = {
    id: string

    kind: NodeKind

    name: string

    position: Position

    config: Record<string, unknown>
}


/**
 * Una arista de retroalimentación vuelve a un nodo anterior (ciclo acotado).
 * No cuenta como dependencia: el runtime re-ejecuta el "cuerpo" del bucle
 * (los nodos entre destino y origen) hasta `maxIterations` veces.
 */
export type FeedbackConfig = {
    /** Máximo de re-ejecuciones del cuerpo del bucle (1..50). */
    maxIterations: number
    /** Qué hacer si se agotan las iteraciones y la arista sigue activa. */
    onExhausted: "fail" | "continue"
}


export type PairtialEdge = {
    id: string

    sourceNodeId: string
    targetNodeId: string

    sourcePortId?: string
    targetPortId?: string

    feedback?: FeedbackConfig
}


export type PairtialSystem = {
    id: string

    name: string

    nodes: PairtialNode[]
    edges: PairtialEdge[]

    createdAt: number
    updatedAt: number
}


export type NodeExecutionState =
    | "idle"
    | "waiting"
    | "running"
    | "success"
    | "error"
    | "skipped"