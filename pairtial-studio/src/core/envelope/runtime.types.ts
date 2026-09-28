import type {
    Envelope
} from "../envelope/envelope.types"

import type {
    NodeExecutionState
} from "../types/types"


export type RuntimeEvent =
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
    }

    | {
        type: "run.failed"

        runId: string
        timestamp: number

        error: string
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