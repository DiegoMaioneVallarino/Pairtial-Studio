
import {
    createEnvelope
} from "../envelope/createEnvelope"

import type {
    NodeExecutor
} from "./executor.types"


export const hrExecutor: NodeExecutor =
    async ({
        node,
        inputs
    }) => {

        const startedAt = performance.now()

        await new Promise<void>(
            resolve => setTimeout(resolve, 450)
        )

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
