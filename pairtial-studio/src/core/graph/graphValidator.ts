import { connectionError } from "../ports/portRegistry"
import { analyzeLoops, MAX_ITERATIONS_LIMIT } from "./loops"
import { createExecutionPlan } from "./executionPlan"
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


        const source = system.nodes.find(n => n.id === edge.sourceNodeId)
        const target = system.nodes.find(n => n.id === edge.targetNodeId)
        if (source && target) {
            const error = connectionError(source.kind, target.kind, edge.sourcePortId, edge.targetPortId)
            if (error) errors.push(`Edge "${edge.id}": ${error}`)
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


    for (const edge of system.edges) {
        if (!edge.feedback) continue
        const { maxIterations, onExhausted } = edge.feedback
        if (!Number.isInteger(maxIterations) || maxIterations < 1 || maxIterations > MAX_ITERATIONS_LIMIT) {
            errors.push(`Edge "${edge.id}": maxIterations must be an integer between 1 and ${MAX_ITERATIONS_LIMIT}`)
        }
        if (onExhausted !== "fail" && onExhausted !== "continue") {
            errors.push(`Edge "${edge.id}": onExhausted must be "fail" or "continue"`)
        }
    }

    for (const loop of analyzeLoops(system)) {
        const { edge } = loop
        if (!nodeIds.has(edge.sourceNodeId) || !nodeIds.has(edge.targetNodeId)) continue
        if (edge.sourceNodeId === edge.targetNodeId) continue
        if (!loop.bodyNodeIds.has(edge.targetNodeId) || !loop.bodyNodeIds.has(edge.sourceNodeId)) {
            errors.push(`Edge "${edge.id}": a feedback edge must point back to an upstream node`)
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


    if (errors.length === 0) {
        try {
            createExecutionPlan(system)
        } catch (error) {
            errors.push(error instanceof Error ? error.message : String(error))
        }
    }

    return {
        valid:
            errors.length === 0,

        errors
    }
}