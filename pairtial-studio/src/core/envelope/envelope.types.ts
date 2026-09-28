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

    payload: T

    metadata?: EnvelopeMetadata
}