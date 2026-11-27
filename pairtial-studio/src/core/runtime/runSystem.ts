import { ArtifactRegistry, artifactDependencies } from "../artifacts/artifactRegistry"
import { scheduleNodes } from "./scheduler"
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
    const ancestry = [...(options.ancestry ?? []), system.id]
    const fabrics = options.ancestry ? options.fabrics ?? [] : structuredClone(options.fabrics ?? [])

    const controller = new AbortController()
    const signal = controller.signal
    const forwardAbort = () => controller.abort(options.signal?.reason)
    options.signal?.addEventListener("abort", forwardAbort, { once: true })
    if (options.signal?.aborted) forwardAbort()

    const artifacts = options.artifacts ?? new ArtifactRegistry()
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
                nodeStates[node.id] === "awaiting-human" || nodeStates[node.id] === "waiting"
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
            if (nodeStates[id] === "awaiting-human" || nodeStates[id] === "waiting" || nodeStates[id] === "running") nodeStates[id] = "idle"
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

        await scheduleNodes(system, executionPlan, options.maxConcurrency ?? 4, signal,
            () => controller.abort(), async (node, suspend) => {

            signal.throwIfAborted()

            // Buscar conexiones entrantes.

            const incomingEdges =
                system.edges.filter(
                    edge =>
                        edge.targetNodeId === node.id
                )

            const inputs = incomingEdges.length === 0 ? (options.initialInputs ?? []).map(e => ({...e, targetPortId: "input"})) : incomingEdges.flatMap(edge => {
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
                return
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
                            mockDatabase,
                            artifacts,
                            requestDecision: async request => {
                                if (!options.decisions) throw new Error("Human node requires a DecisionManager")
                                if (request.mode === "selection" && !request.choices.length) throw new Error("Selection requires choices")
                                nodeStates[node.id] = "awaiting-human"
                                emit({type:"decision.requested",runId,nodeId:node.id,timestamp:Date.now()})
                                const response = await suspend(options.decisions.request(request,signal))
                                nodeStates[node.id] = "running"
                                emit({type:"decision.responded",runId,nodeId:node.id,timestamp:Date.now()})
                                return response
                            },
                            runFabric: async (id, inputs) => {
                                if (ancestry.includes(id)) throw new Error(`Recursive Fabric: ${id}`)
                                if (ancestry.length >= 8) throw new Error("Fabric nesting limit reached")
                                const child = fabrics.find(f => f.id === id)
                                if (!child) throw new Error(`Fabric not found: ${id}`)
                                const result = await runSystem(child, {signal, maxConcurrency: 1, fabrics, ancestry, initialInputs: inputs, artifacts, decisions: options.decisions})
                                return {...result, envelopes: result.envelopes.filter(e => !child.edges.some(edge => edge.sourceNodeId === e.sourceNodeId))}
                            }
                        }
                    })

                signal.throwIfAborted()

                output.artifacts = artifactDependencies([...inputs, output])
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
                    throw error
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

                throw error
            }
        })

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

        if (options.signal?.aborted || (error instanceof Error && error.name === "AbortError")) {
            return cancelRun()
        }

        return failRun(error)
    } finally {
        options.signal?.removeEventListener("abort", forwardAbort)
    }
}
