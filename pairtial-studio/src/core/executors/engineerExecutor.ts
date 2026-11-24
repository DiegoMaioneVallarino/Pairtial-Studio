import {
    createEnvelope
} from "../envelope/createEnvelope"

import type {
    NodeExecutor
} from "./executor.types"


export const engineerExecutor: NodeExecutor =
    async ({
        node,
        inputs
    }) => {

        const startedAt = performance.now()

        

        const received = inputs.map(
            envelope => envelope.payload
        )

        const durationMs =
            performance.now() - startedAt

        return createEnvelope({
            sourceNodeId: node.id,

            payload: {
                type: "engineering",

                status: "completed", instructions: node.config.instructions,

                artifact: {
                    kind: node.config.artifactKind,
                    language: node.config.language,
                    content:
                        String(node.config.content || "// Código simulado generado por Engineer")
                },

                received
            },

            metadata: {
                mimeType: "application/json",
                durationMs
            }
        })
    }
