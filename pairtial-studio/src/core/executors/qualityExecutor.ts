import { abortableDelay } from "../runtime/abortableDelay"
import {
    createEnvelope
} from "../envelope/createEnvelope"

import type {
    NodeExecutor
} from "./executor.types"


export const qualityExecutor: NodeExecutor =
    async ({
        node,
        inputs,
        context
    }) => {

        const startedAt =
            performance.now()


        await abortableDelay(250, context.signal)


        const durationMs =
            performance.now() -
            startedAt


        return createEnvelope({
            sourceNodeId:
                node.id,

            payload: {
                passed: true,

                score: 0.92,

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