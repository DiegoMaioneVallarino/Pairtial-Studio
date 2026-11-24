import { conditionalPort } from "./decisionEngine"

import type {
    Envelope
} from "../envelope/envelope.types"

import type {
    PairtialSystem
} from "../types/types"

import type {
    RuntimeEvent,
    RuntimeResult,
    NodeExecutionStates,
    RuntimeOptions
} from "./runtime.types"

import {
    validateGraph
} from "../graph/graphValidator"

import {
    createExecutionPlan
} from "../graph/executionPlan"

import {
    getExecutor
} from "../executors/executorRegistry"


export async function runSystem(
    system: PairtialSystem,
    options: RuntimeOptions = {}
): Promise<RuntimeResult> {

    const runId = crypto.randomUUID()

    const fallbackController =
        new AbortController()

    const signal =
        options.signal ??
        fallbackController.signal

    const mockDatabase = new Map<string, unknown>()
    const events: RuntimeEvent[] = []
    const envelopes: Envelope[] = []
    const nodeStates: NodeExecutionStates = {}

    function emit(event: RuntimeEvent) {
        events.push(event)
        options.onEvent?.(event)
    }

    function isCancelled(error: unknown): boolean {
        return (
            signal.aborted ||
            (
                error instanceof Error &&
                error.name === "AbortError"
            )
        )
    }

    function cancelRun(): RuntimeResult {

        // Los nodos que no terminaron
        // dejan de estar esperando o ejecutándose.

        for (const node of system.nodes) {
            if (
                nodeStates[node.id] === "running" ||
                nodeStates[node.id] === "waiting"
            ) {
                nodeStates[node.id] = "idle"
            }
        }

        emit({
            type: "run.cancelled",
            runId,
            timestamp: Date.now()
        })

        return {
            runId,
            success: false,
            envelopes,
            events,
            nodeStates
        }
    }

    function failRun(error: unknown): RuntimeResult {
        for (const id of Object.keys(nodeStates)) {
            if (nodeStates[id] === "waiting" || nodeStates[id] === "running") nodeStates[id] = "idle"
        }

        const message =
            error instanceof Error
                ? error.message
                : String(error)

        emit({
            type: "run.failed",
            runId,
            timestamp: Date.now(),
            error: message
        })

        return {
            runId,
            success: false,
            envelopes,
            events,
            nodeStates
        }
    }

    // Inicializar estados.

    for (const node of system.nodes) {
        nodeStates[node.id] = "waiting"
    }

    emit({
        type: "run.started",
        runId,
        timestamp: Date.now()
    })

    try {

        signal.throwIfAborted()

        // Validar grafo.

        const validation =
            validateGraph(system)

        if (!validation.valid) {
            return failRun(
                new Error(
                    validation.errors.join("\n")
                )
            )
        }

        // Calcular orden de ejecución.

        const executionPlan =
            createExecutionPlan(system)

        // Ejecutar cada nodo.

        for (const node of executionPlan) {

            signal.throwIfAborted()

            // Buscar conexiones entrantes.

            const incomingEdges =
                system.edges.filter(
                    edge =>
                        edge.targetNodeId === node.id
                )

            const inputs = incomingEdges.flatMap(edge => {
                const sourcePortId = edge.sourcePortId ?? "output"
                return envelopes.filter(e => e.sourceNodeId === edge.sourceNodeId && (e.sourcePortId ?? "output") === sourcePortId)
                    .map(e => ({...e, sourcePortId, targetPortId: edge.targetPortId ?? "input", edgeId: edge.id}))
            })

            // A join runs once when at least one incoming route delivers data.
            for (const edge of incomingEdges) {
                emit({type: "edge.routed", runId, nodeId: node.id, edgeId: edge.id,
                    timestamp: Date.now(), active: inputs.some(input => input.edgeId === edge.id)})
            }
            if (incomingEdges.length > 0 && inputs.length === 0) {
                nodeStates[node.id] = "skipped"
                emit({type: "node.skipped", runId, nodeId: node.id, timestamp: Date.now(), reason: "No active incoming route"})
                continue
            }

            nodeStates[node.id] = "running"

            emit({
                type: "node.started",
                runId,
                nodeId: node.id,
                timestamp: Date.now()
            })

            for (const envelope of inputs) {

                signal.throwIfAborted()

                emit({
                    type: "envelope.received",
                    runId,
                    nodeId: node.id,
                    timestamp: Date.now(),
                    envelope
                })
            }

            try {

                const executor =
                    getExecutor(node.kind)

                const output =
                    await executor({
                        node,
                        inputs,
                        context: {
                            runId,
                            system,
                            signal,
                            mockDatabase
                        }
                    })

                signal.throwIfAborted()

                output.sourcePortId = "output"
                envelopes.push(output)
                const branch = conditionalPort(node.kind, output)
                if (branch) {
                    const routed: Envelope = {...output, id: crypto.randomUUID(), sourcePortId: branch, metadata: undefined}
                    envelopes.push(routed)
                    emit({type: "envelope.created", runId, nodeId: node.id, timestamp: Date.now(), envelope: routed})
                }
                if (node.kind === "quality") {
                    const score = (output.payload as {score: number}).score
                    const scoreEnvelope: Envelope = { id: crypto.randomUUID(), createdAt: Date.now(), sourceNodeId: node.id, sourcePortId: "score", payload: score }
                    envelopes.push(scoreEnvelope)
                    emit({type: "envelope.created", runId, nodeId: node.id, timestamp: Date.now(), envelope: scoreEnvelope})
                }

                emit({
                    type: "envelope.created",
                    runId,
                    nodeId: node.id,
                    timestamp: Date.now(),
                    envelope: output
                })

                nodeStates[node.id] = "success"

                emit({
                    type: "node.completed",
                    runId,
                    nodeId: node.id,
                    timestamp: Date.now(),
                    envelope: output
                })

            } catch (error) {

                if (isCancelled(error)) {
                    return cancelRun()
                }

                nodeStates[node.id] = "error"

                const message =
                    error instanceof Error
                        ? error.message
                        : String(error)

                emit({
                    type: "node.failed",
                    runId,
                    nodeId: node.id,
                    timestamp: Date.now(),
                    error: message
                })

                return failRun(error)
            }
        }

        signal.throwIfAborted()

        // Ejecución completada.

        emit({
            type: "run.completed",
            runId,
            timestamp: Date.now()
        })

        return {
            runId,
            success: true,
            envelopes,
            events,
            nodeStates
        }

    } catch (error) {

        if (isCancelled(error)) {
            return cancelRun()
        }

        return failRun(error)
    }
}
