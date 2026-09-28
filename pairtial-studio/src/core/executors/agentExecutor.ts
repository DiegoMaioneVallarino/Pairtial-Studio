import {
    createEnvelope
} from "../envelope/createEnvelope"

import type {
    NodeExecutor
} from "./executor.types"


export const agentExecutor: NodeExecutor =
    async ({
        node,
        inputs
    }) => {

        const startedAt =
            performance.now()


        /*
         * Por ahora simulamos un modelo.
         *
         * Después esta parte podrá llamar
         * al provider configurado:
         *
         * OpenAI
         * Gemini
         * Anthropic
         * Local
         * etc.
         */

        await new Promise<void>(
            resolve => {
                setTimeout(
                    resolve,
                    500
                )
            }
        )


        const inputPayloads =
            inputs.map(
                envelope =>
                    envelope.payload
            )


        const durationMs =
            performance.now() -
            startedAt


        return createEnvelope({
            sourceNodeId:
                node.id,

            payload: {
                type: "text",

                text:
                    `Respuesta simulada de ${node.name}`,

                received:
                    inputPayloads
            },

            metadata: {
                mimeType:
                    "application/json",

                durationMs
            }
        })
    }