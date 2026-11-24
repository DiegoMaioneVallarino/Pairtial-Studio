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

    /** Número de ejecución (1, 2, …) del nodo que lo produjo; crece en cada vuelta de un bucle. */
    iteration?: number
    /** true si llegó por una arista de retroalimentación. */
    feedback?: boolean

    payload: T

    metadata?: EnvelopeMetadata
}