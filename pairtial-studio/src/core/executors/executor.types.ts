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
    artifacts: import("../artifacts/artifactRegistry").ArtifactRegistry
    mockDatabase: Map<string, unknown>
    requestDecision: (request: Omit<import("../decisions/decisionManager").DecisionRequest,"id"|"createdAt">) => Promise<import("../decisions/decisionManager").DecisionResponse>
    runFabric: (id: string, inputs: Envelope[]) => Promise<import("../runtime/runtime.types").RuntimeResult>
}


export type ExecutorInput = {
    node: PairtialNode

    inputs: Envelope[]

    context: ExecutorContext
}


export type NodeExecutor = (
    input: ExecutorInput
) => Promise<Envelope>