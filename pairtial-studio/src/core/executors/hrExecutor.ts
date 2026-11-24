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

        

        const received = inputs.map(
            envelope => envelope.payload
        )

        return createEnvelope({
            sourceNodeId: node.id,

            payload: {
                type: "human-resources",

                recommendation: {
                    role: node.config.role,
                    reason:
                        node.config.reason
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
