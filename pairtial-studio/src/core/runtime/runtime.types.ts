import type {
    Envelope
} from "../envelope/envelope.types"

import type {
    NodeExecutionState
} from "../types/types"

import type { ProviderRegistry } from "../llm/provider.types"



export type RuntimeEvent =
    | { type: "node.retrying"; runId: string; nodeId: string; timestamp: number; attempt: number; maxAttempts: number; error: string; delayMs: number }
    | { type: "loop.iterated"; runId: string; edgeId: string; nodeId: string; timestamp: number; iteration: number; maxIterations: number; nodeIds: string[] }
    | { type: "loop.exhausted"; runId: string; edgeId: string; nodeId: string; timestamp: number; maxIterations: number; onExhausted: "fail" | "continue" }
    | { type: "node.skipped"; runId: string; nodeId: string; timestamp: number; reason: string }
    | { type: "edge.routed"; runId: string; nodeId: string; edgeId: string; timestamp: number; active: boolean }
    | {
        type: "run.started"
        runId: string
        timestamp: number
    }
    | {
        type: "node.started"
        runId: string
        nodeId: string
        timestamp: number
    }
    | {
        type: "node.completed"
        runId: string
        nodeId: string
        timestamp: number
        envelope: Envelope
    }
    | {
        type: "node.failed"
        runId: string
        nodeId: string
        timestamp: number
        error: string
    }
    | {
        type: "envelope.created"
        runId: string
        nodeId: string
        timestamp: number
        envelope: Envelope
    }
    | {
        type: "run.completed"
        runId: string
        timestamp: number
    }| {
    type: "run.cancelled"
    runId: string
    timestamp: number
}
    | {
        type: "run.failed"
        runId: string
        timestamp: number
        error: string
    }
    
| {
    type: "envelope.received"
    runId: string
    nodeId: string
    timestamp: number
    envelope: Envelope
}



export type NodeExecutionStates =
    Record<string, NodeExecutionState>


export type RuntimeResult = {
    runId: string

    success: boolean

    envelopes: Envelope[]

    events: RuntimeEvent[]

    nodeStates: NodeExecutionStates
}

export type RuntimeEventListener = (
    event: RuntimeEvent
) => void


export type RuntimeOptions = {
    onEvent?: RuntimeEventListener
    signal?: AbortSignal
    maxConcurrency?: number
    /** Proveedores LLM disponibles; por defecto solo `mock`. */
    providers?: ProviderRegistry
    /** Fuente de azar para los fallos simulados; por defecto Math.random. */
    random?: () => number
}