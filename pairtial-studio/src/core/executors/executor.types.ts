import type {
    Envelope
} from "../envelope/envelope.types"

import type {
    PairtialNode,
    PairtialSystem
} from "../types/types"


export type ExecutorContext = {
    runId: string
    system: PairtialSystem
    signal: AbortSignal
}


export type ExecutorInput = {
    node: PairtialNode

    inputs: Envelope[]

    context: ExecutorContext
}


export type NodeExecutor = (
    input: ExecutorInput
) => Promise<Envelope>