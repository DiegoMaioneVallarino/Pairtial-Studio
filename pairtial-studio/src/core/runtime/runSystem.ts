import { createToolRegistry } from "../tools/toolRegistry"
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

    const restored = options.checkpoint
    if(restored && (restored.status!=="running" || restored.system.id!==system.id)) throw new Error("Invalid checkpoint")
    if(restored) system=structuredClone(restored.system)
    const runId = restored?.runId ?? crypto.randomUUID()
    const ancestry = [...(options.ancestry ?? []), system.id]
    const fabrics = options.ancestry ? options.fabrics ?? [] : structuredClone(restored?.fabrics ?? options.fabrics ?? [])

    const controller = new AbortController()
    const signal = controller.signal
    const forwardAbort = () => controller.abort(options.signal?.reason)
    options.signal?.addEventListener("abort", forwardAbort, { once: true })
    if (options.signal?.aborted) forwardAbort()

    const tools = options.tools ?? createToolRegistry()
    const toolPermissions = options.toolPermissions ?? ["mock.execute"]
    const artifacts = options.artifacts ?? new ArtifactRegistry()
    if(restored) artifacts.restore(restored.artifacts)
    const mockDatabase = new Map<string, unknown>(restored?.database)
    const events: RuntimeEvent[] = structuredClone(restored?.events ?? [])
    const envelopes: Envelope[] = structuredClone(restored?.envelopes ?? [])
    const nodeStates: NodeExecutionStates = {}
    const pending = structuredClone(restored?.pending ?? {})
    const responses = structuredClone(restored?.responses ?? {})
    const settled = system.nodes.filter(n=>restored?.nodeStates[n.id]==="success"||restored?.nodeStates[n.id]==="skipped").map(n=>n.id)
    const concurrency=restored?.maxConcurrency ?? options.maxConcurrency ?? 4
    function checkpoint(status:import("../storage/runJournal").Checkpoint["status"]="running") {
        options.onCheckpoint?.(structuredClone({runId,system,fabrics,maxConcurrency:concurrency,database:[...mockDatabase],pending,responses,artifacts:artifacts.list(),status,updatedAt:Date.now(),success:status==="completed",events,envelopes,nodeStates}))
    }

    function emit(event: RuntimeEvent) {
        events.push(event)
        if(event.type==="node.completed"||event.type==="node.skipped"||event.type==="run.started") checkpoint()
        if(event.type==="run.completed") checkpoint("completed")
        if(event.type==="run.failed") checkpoint("failed")
        if(event.type==="run.cancelled") checkpoint("cancelled")
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
        nodeStates[node.id] = settled.includes(node.id) ? restored!.nodeStates[node.id] : "waiting"
    }

    if(!restored) emit({
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

        await scheduleNodes(system, executionPlan, concurrency, signal,
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
                            invokeTool: async (toolId,args) => {
                                emit({type:"tool.started",runId,nodeId:node.id,toolId,timestamp:Date.now()})
                                try {
                                    const result=await tools.invoke(toolId,args,signal,toolPermissions)
                                    emit({type:"tool.completed",runId,nodeId:node.id,toolId,timestamp:Date.now()})
                                    return result
                                } catch(error) {
                                    emit({type:"tool.failed",runId,nodeId:node.id,toolId,timestamp:Date.now(),error:String(error)})
                                    throw error
                                }
                            },
                            artifacts,
                            requestDecision: async request => {
                                if (!options.decisions) throw new Error("Human node requires a DecisionManager")
                                if (request.mode === "selection" && !request.choices.length) throw new Error("Selection requires choices")
                                nodeStates[node.id] = "awaiting-human"
                                emit({type:"decision.requested",runId,nodeId:node.id,timestamp:Date.now()})
                                const existing = pending[node.id] ?? {...request,id:crypto.randomUUID(),createdAt:Date.now()}
                                pending[node.id]=existing
                                checkpoint()
                                const response = responses[node.id] ?? await suspend(options.decisions.request(request,signal,existing,r=>{responses[node.id]=r;checkpoint()}))
                                nodeStates[node.id] = "running"
                                emit({type:"decision.responded",runId,nodeId:node.id,timestamp:Date.now()})
                                return response
                            },
                            runFabric: async (id, inputs) => {
                                if (ancestry.includes(id)) throw new Error(`Recursive Fabric: ${id}`)
                                if (ancestry.length >= 8) throw new Error("Fabric nesting limit reached")
                                const child = fabrics.find(f => f.id === id)
                                if (!child) throw new Error(`Fabric not found: ${id}`)
                                const result = await runSystem(child, {signal, maxConcurrency: 1, fabrics, ancestry, initialInputs: inputs, tools, toolPermissions, artifacts, decisions: options.decisions})
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
                delete pending[node.id]
                delete responses[node.id]

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
        }, settled)

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
