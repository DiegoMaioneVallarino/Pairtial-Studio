import {
    createEnvelope
} from "../envelope/createEnvelope"

import type {
    NodeExecutor
} from "./executor.types"


export const apiExecutor: NodeExecutor =
    async ({
        node,
        inputs, context
    }) => {

        if (node.config.toolId) {
            const toolId=String(node.config.toolId)
            const result=await context.invokeTool(toolId,JSON.parse(String(node.config.toolArgs)))
            return createEnvelope({sourceNodeId:node.id,payload:{type:"tool",toolId,result}})
        }
        const startedAt =
            performance.now()


        


        const durationMs =
            performance.now() -
            startedAt


        return createEnvelope({
            sourceNodeId:
                node.id,

            payload: {
                status: node.config.status,
                url: node.config.url, method: node.config.method, headers: JSON.parse(String(node.config.headers)),
                response: node.config.response ? JSON.parse(String(node.config.response)) : null,

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