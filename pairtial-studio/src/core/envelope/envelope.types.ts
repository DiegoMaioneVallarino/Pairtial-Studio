export type EnvelopeMetadata = {
    mimeType?: string
    tokens?: number
    cost?: number
    durationMs?: number
}


export type Envelope<T = unknown> = {
    id: string

    createdAt: number

    sourceNodeId: string
    sourcePortId?: string
    targetPortId?: string
    edgeId?: string

    payload: T

    metadata?: EnvelopeMetadata
}