import {
    createEnvelope
} from "../envelope/createEnvelope"

import type {
    NodeExecutor
} from "./executor.types"


export const qualityExecutor: NodeExecutor =
    async ({
        node,
        inputs
    }) => {

        const startedAt =
            performance.now()


        


        const durationMs =
            performance.now() -
            startedAt


        return createEnvelope({
            sourceNodeId:
                node.id,

            payload: {
                passed: Number(node.config.score) >= Number(node.config.threshold),
                criteria: node.config.criteria, threshold: Number(node.config.threshold)/100,

                score: Number(node.config.score)/100,

                received:
                    inputs.map(
                        envelope =>
                            envelope.payload
                    )
            },

            metadata: {
                mimeType:
                    "application/json",

                durationMs
            }
        })
    }