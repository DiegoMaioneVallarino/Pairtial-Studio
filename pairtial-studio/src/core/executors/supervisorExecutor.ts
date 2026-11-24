import { abortableDelay } from "../runtime/abortableDelay"

import {
    createEnvelope
} from "../envelope/createEnvelope"

import type {
    NodeExecutor
} from "./executor.types"


export const supervisorExecutor: NodeExecutor =
    async ({
        node,
        inputs,
        context
    }) => {

        const startedAt = performance.now()

        await abortableDelay(400, context.signal)

        const received = inputs.map(
            envelope => envelope.payload
        )

        return createEnvelope({
            sourceNodeId: node.id,

            payload: {
                type: "supervision",

                decision: "approved",

                message:
                    "Resultado aprobado por Supervisor (simulado)",

                inspectedEnvelopes:
                    inputs.map(envelope => envelope.id),

                received
            },

            metadata: {
                mimeType: "application/json",
                durationMs:
                    performance.now() - startedAt
            }
        })
    }
