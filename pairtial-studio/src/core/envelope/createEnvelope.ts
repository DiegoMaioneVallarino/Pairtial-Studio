import type {
    Envelope,
    EnvelopeMetadata
} from "./envelope.types"


type CreateEnvelopeInput<T> = {
    sourceNodeId: string

    payload: T

    metadata?: EnvelopeMetadata
}


export function createEnvelope<T>(
    input: CreateEnvelopeInput<T>
): Envelope<T> {

    return {
        id: crypto.randomUUID(),

        createdAt: Date.now(),

        sourceNodeId:
            input.sourceNodeId,

        payload:
            input.payload,

        metadata:
            input.metadata
    }
}