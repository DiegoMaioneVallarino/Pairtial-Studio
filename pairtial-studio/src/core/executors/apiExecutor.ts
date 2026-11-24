import { abortableDelay } from "../runtime/abortableDelay"
import {
    createEnvelope
} from "../envelope/createEnvelope"

import type {
    NodeExecutor
} from "./executor.types"


export const apiExecutor: NodeExecutor =
    async ({
        node,
        inputs,
        context
    }) => {

        const startedAt =
            performance.now()


        await abortableDelay(350, context.signal)


        const durationMs =
            performance.now() -
            startedAt


        return createEnvelope({
            sourceNodeId:
                node.id,

            payload: {
                status: 200,

                data: {
                    message:
                        "Mock external API data",

                    received:
                        inputs.map(
                            envelope =>
                                envelope.payload
                        )
                }
            },

            metadata: {
                mimeType:
                    "application/json",

                durationMs
            }
        })
    }