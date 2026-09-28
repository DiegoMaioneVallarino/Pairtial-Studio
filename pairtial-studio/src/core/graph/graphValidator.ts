import type {
    PairtialSystem
} from "../types/types"

import {
    getExecutor
} from "../executors/executorRegistry"


export type GraphValidationResult = {
    valid: boolean

    errors: string[]
}


export function validateGraph(
    system: PairtialSystem
): GraphValidationResult {

    const errors: string[] = []

    const nodeIds =
        new Set(
            system.nodes.map(
                node => node.id
            )
        )


    if (system.nodes.length === 0) {

        errors.push(
            "System has no nodes"
        )
    }


    for (const edge of system.edges) {

        if (
            !nodeIds.has(
                edge.sourceNodeId
            )
        ) {
            errors.push(
                `Edge "${edge.id}" references missing source node "${edge.sourceNodeId}"`
            )
        }


        if (
            !nodeIds.has(
                edge.targetNodeId
            )
        ) {
            errors.push(
                `Edge "${edge.id}" references missing target node "${edge.targetNodeId}"`
            )
        }


        if (
            edge.sourceNodeId ===
            edge.targetNodeId
        ) {
            errors.push(
                `Node "${edge.sourceNodeId}" cannot connect to itself`
            )
        }
    }


    for (const node of system.nodes) {

        try {

            getExecutor(
                node.kind
            )

        } catch {

            errors.push(
                `Node "${node.name}" has no executor for kind "${node.kind}"`
            )
        }
    }


    return {
        valid:
            errors.length === 0,

        errors
    }
}