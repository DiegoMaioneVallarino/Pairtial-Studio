import { abortableDelay } from "../runtime/abortableDelay"

import {
    createEnvelope
} from "../envelope/createEnvelope"

import type {
    NodeExecutor
} from "./executor.types"


export const engineerExecutor: NodeExecutor =
    async ({
        node,
        inputs,
        context
    }) => {

        const startedAt = performance.now()

        await abortableDelay(700, context.signal)

        const received = inputs.map(
            envelope => envelope.payload
        )

        const durationMs =
            performance.now() - startedAt

        return createEnvelope({
            sourceNodeId: node.id,

            payload: {
                type: "engineering",

                status: "completed",

                artifact: {
                    kind: "code",
                    language: "typescript",
                    content:
                        "// Código simulado generado por Engineer"
                },

                received
            },

            metadata: {
                mimeType: "application/json",
                durationMs
            }
        })
    }
