import {
    createEnvelope
} from "../envelope/createEnvelope"

import type {
    NodeExecutor
} from "./executor.types"


export const supervisorExecutor: NodeExecutor =
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
                type: "supervision",

                decision: node.config.strategy === "quality" ? (received.some(p => typeof p === "object" && p !== null && "passed" in p && p.passed === false) ? "revise" : received.some(p => typeof p === "object" && p !== null && "passed" in p && p.passed === true) ? "approved" : "revise") : node.config.decision,
                rules: node.config.rules, strategy: node.config.strategy,

                message:
                    "Evaluación de Supervisor (simulada)",

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
