import { abortableDelay } from "../runtime/abortableDelay"

import {
    createEnvelope
} from "../envelope/createEnvelope"

import type {
    NodeExecutor
} from "./executor.types"


export const hrExecutor: NodeExecutor =
    async ({
        node,
        inputs,
        context
    }) => {

        const startedAt = performance.now()

        await abortableDelay(450, context.signal)

        const received = inputs.map(
            envelope => envelope.payload
        )

        return createEnvelope({
            sourceNodeId: node.id,

            payload: {
                type: "human-resources",

                recommendation: {
                    role: "engineer",
                    reason:
                        "Especialista recomendado para tareas técnicas (simulado)"
                },

                received
            },

            metadata: {
                mimeType: "application/json",
                durationMs:
                    performance.now() - startedAt
            }
        })
    }
