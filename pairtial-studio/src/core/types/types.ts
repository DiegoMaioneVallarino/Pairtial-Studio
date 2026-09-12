export type NodeKind =
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

export type PairtialEdge = {
    id: string

    sourceNodeId: string
    targetNodeId: string

    sourcePortId?: string
    targetPortId?: string
}

export type PairtialSystem = {
    id: string

    name: string

    nodes: PairtialNode[]

    edges: PairtialEdge[]
}

export type NodeExecutionState =
    | "idle"
    | "waiting"
    | "running"
    | "success"
    | "error"