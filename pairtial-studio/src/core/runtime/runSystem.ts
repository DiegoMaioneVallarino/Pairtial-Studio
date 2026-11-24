import { scheduleNodes } from "./scheduler"
import { conditionalPort } from "./decisionEngine"

import type { Envelope } from "../envelope/envelope.types"
import type { PairtialNode, PairtialSystem } from "../types/types"
import type { RuntimeEvent, RuntimeResult, NodeExecutionStates, RuntimeOptions } from "./runtime.types"

import { validateGraph } from "../graph/graphValidator"
import { createExecutionPlan } from "../graph/executionPlan"
import { analyzeLoops } from "../graph/loops"
import { getExecutor } from "../executors/executorRegistry"
import { defaultProviders } from "../llm/providerRegistry"


export async function runSystem(
    system: PairtialSystem,
    options: RuntimeOptions = {}
): Promise<RuntimeResult> {

    const runId = crypto.randomUUID()

    const controller = new AbortController()
    const signal = controller.signal
    const forwardAbort = () => controller.abort(options.signal?.reason)
    options.signal?.addEventListener("abort", forwardAbort, { once: true })
    if (options.signal?.aborted) forwardAbort()

    const providers = options.providers ?? defaultProviders()
    const random = options.random ?? Math.random
    const mockDatabase = new Map<string, unknown>()
    const events: RuntimeEvent[] = []
    /** Historial completo (todas las iteraciones). */
    const envelopes: Envelope[] = []
    /** Última salida por nodo y puerto: lo que ven los consumidores. */
    const latest = new Map<string, Map<string, Envelope>>()
    /** Última envelope emitida por el origen de cada arista de retroalimentación. */
    const feedbackInbox = new Map<string, Envelope>()
    const loopIterations = new Map<string, number>()
    const nodeRuns = new Map<string, number>()
    const nodeStates: NodeExecutionStates = {}
    const nodesById = new Map(system.nodes.map(node => [node.id, node]))

    function emit(event: RuntimeEvent) {
        events.push(event)
        options.onEvent?.(event)
    }

    function publish(nodeId: string, envelope: Envelope) {
        envelopes.push(envelope)
        let ports = latest.get(nodeId)
        if (!ports) {
            ports = new Map()
            latest.set(nodeId, ports)
        }
        ports.set(envelope.sourcePortId ?? "output", envelope)
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

    /**
     * Tras ejecutar `node`: si es origen de una arista de retroalimentación
     * activa y quedan iteraciones, devuelve el cuerpo del bucle para re-ejecutarlo.
     */
    const loops = analyzeLoops(system)
    function rewindLoops(node: PairtialNode): PairtialNode[] | undefined {
        const active = loops.filter(loop =>
            loop.edge.sourceNodeId === node.id &&
            latest.get(node.id)?.has(loop.edge.sourcePortId ?? "output")
        )
        if (active.length === 0) return undefined

        const body = new Set<string>()
        for (const loop of active) {
            const done = loopIterations.get(loop.edge.id) ?? 0
            const { maxIterations, onExhausted } = loop.feedback

            if (done >= maxIterations) {
                emit({ type: "loop.exhausted", runId, edgeId: loop.edge.id, nodeId: node.id, timestamp: Date.now(), maxIterations, onExhausted })
                if (onExhausted === "fail") {
                    const message = `El bucle "${loop.edge.id}" no convergió tras ${maxIterations} iteraciones`
                    nodeStates[node.id] = "error"
                    emit({ type: "node.failed", runId, nodeId: node.id, timestamp: Date.now(), error: message })
                    throw new Error(message)
                }
                continue
            }

            const source = latest.get(node.id)!.get(loop.edge.sourcePortId ?? "output")!
            feedbackInbox.set(loop.edge.id, source)
            loopIterations.set(loop.edge.id, done + 1)
            for (const id of loop.bodyNodeIds) body.add(id)
            emit({
                type: "loop.iterated", runId, edgeId: loop.edge.id, nodeId: node.id, timestamp: Date.now(),
                iteration: done + 1, maxIterations, nodeIds: [...loop.bodyNodeIds]
            })
            emit({ type: "edge.routed", runId, nodeId: loop.edge.targetNodeId, edgeId: loop.edge.id, timestamp: Date.now(), active: true })
        }
        if (body.size === 0) return undefined

        const rewound: PairtialNode[] = []
        for (const id of body) {
            const bodyNode = nodesById.get(id)
            if (!bodyNode) continue
            latest.delete(id)
            nodeStates[id] = "waiting"
            rewound.push(bodyNode)
        }
        return rewound
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

        await scheduleNodes(system, executionPlan, {
            maxConcurrency: options.maxConcurrency ?? 4,
            signal,
            abortPeers: () => controller.abort(),
            afterExecute: rewindLoops,
            execute: async node => {

            signal.throwIfAborted()

            // Buscar conexiones entrantes.

            const incomingEdges =
                system.edges.filter(
                    edge =>
                        edge.targetNodeId === node.id
                )
            const forwardEdges = incomingEdges.filter(edge => !edge.feedback)

            const forwardInputs = forwardEdges.flatMap(edge => {
                const sourcePortId = edge.sourcePortId ?? "output"
                const envelope = latest.get(edge.sourceNodeId)?.get(sourcePortId)
                return envelope
                    ? [{ ...envelope, sourcePortId, targetPortId: edge.targetPortId ?? "input", edgeId: edge.id }]
                    : []
            })
            const feedbackInputs = incomingEdges.filter(edge => edge.feedback).flatMap(edge => {
                const envelope = feedbackInbox.get(edge.id)
                return envelope
                    ? [{ ...envelope, targetPortId: edge.targetPortId ?? "input", edgeId: edge.id, feedback: true }]
                    : []
            })
            const inputs = [...forwardInputs, ...feedbackInputs]

            // A join runs once when at least one incoming (forward) route delivers data.
            for (const edge of forwardEdges) {
                emit({type: "edge.routed", runId, nodeId: node.id, edgeId: edge.id,
                    timestamp: Date.now(), active: forwardInputs.some(input => input.edgeId === edge.id)})
            }
            if (forwardEdges.length > 0 && forwardInputs.length === 0) {
                nodeStates[node.id] = "skipped"
                emit({type: "node.skipped", runId, nodeId: node.id, timestamp: Date.now(), reason: "No active incoming route"})
                return
            }

            nodeStates[node.id] = "running"
            const iteration = (nodeRuns.get(node.id) ?? 0) + 1
            nodeRuns.set(node.id, iteration)

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
                            providers,
                            random,
                            iteration,
                            emit
                        }
                    })

                signal.throwIfAborted()

                output.sourcePortId = "output"
                output.iteration = iteration
                publish(node.id, output)
                const branch = conditionalPort(node.kind, output)
                if (branch) {
                    const routed: Envelope = {...output, id: crypto.randomUUID(), sourcePortId: branch, metadata: undefined}
                    publish(node.id, routed)
                    emit({type: "envelope.created", runId, nodeId: node.id, timestamp: Date.now(), envelope: routed})
                }
                if (node.kind === "quality") {
                    const score = (output.payload as {score: number}).score
                    const scoreEnvelope: Envelope = { id: crypto.randomUUID(), createdAt: Date.now(), sourceNodeId: node.id, sourcePortId: "score", iteration, payload: score }
                    publish(node.id, scoreEnvelope)
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
        }})

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
