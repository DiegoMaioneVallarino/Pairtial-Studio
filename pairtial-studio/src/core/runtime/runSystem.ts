import type {
    Envelope
} from "../envelope/envelope.types"

import type {
    PairtialSystem,
    NodeExecutionState
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

    const runId =
        crypto.randomUUID()


    const events: RuntimeEvent[] =
        []

    function emit(
        event: RuntimeEvent
    ) {

        events.push(
            event
        )

        options.onEvent?.(
            event
        )
    }

    const envelopes: Envelope[] =
        []


    const nodeStates: NodeExecutionStates =
        {}


    /*
     * Todos los nodos comienzan esperando.
     */

    for (const node of system.nodes) {

        nodeStates[node.id] =
            "waiting"
    }


    /*
     * Evento inicial.
     */

    emit({
        type: "run.started",

        runId,

        timestamp:
            Date.now()
    })


    /*
     * Validamos antes de ejecutar.
     */

    const validation =
        validateGraph(system)


    if (!validation.valid) {

        const error =
            validation.errors.join(
                "\n"
            )


        emit({
            type: "run.failed",

            runId,

            timestamp:
                Date.now(),

            error
        })


        return {
            runId,

            success: false,

            envelopes,

            events,

            nodeStates
        }
    }


    try {

        /*
         * Calculamos el orden
         * de ejecución.
         */

        const executionPlan =
            createExecutionPlan(
                system
            )


        /*
         * Ejecutamos nodo por nodo.
         */

        for (
            const node
            of executionPlan
        ) {

            nodeStates[node.id] =
                "running"


            emit({
                type: "node.started",

                runId,

                nodeId:
                    node.id,

                timestamp:
                    Date.now()
            })


            /*
             * Buscamos qué nodos
             * alimentan al nodo actual.
             */

            const incomingEdges =
                system.edges.filter(
                    edge =>
                        edge.targetNodeId ===
                        node.id
                )


            const sourceNodeIds =
                new Set(
                    incomingEdges.map(
                        edge =>
                            edge.sourceNodeId
                    )
                )


            /*
             * Recuperamos los Envelopes
             * generados por esos nodos.
             */

            const inputs =
                envelopes.filter(
                    envelope =>
                        sourceNodeIds.has(
                            envelope.sourceNodeId
                        )
                )


            try {

                const executor =
                    getExecutor(
                        node.kind
                    )


                const output =
                    await executor({
                        node,

                        inputs,

                        context: {
                            runId,

                            system
                        }
                    })


                envelopes.push(
                    output
                )


                emit({
                    type:
                        "envelope.created",

                    runId,

                    nodeId:
                        node.id,

                    timestamp:
                        Date.now(),

                    envelope:
                        output
                })


                nodeStates[node.id] =
                    "success"


                emit({
                    type:
                        "node.completed",

                    runId,

                    nodeId:
                        node.id,

                    timestamp:
                        Date.now(),

                    envelope:
                        output
                })

            } catch (error) {

                nodeStates[node.id] =
                    "error"


                const message =
                    error instanceof Error
                        ? error.message
                        : String(error)


                emit({
                    type:
                        "node.failed",

                    runId,

                    nodeId:
                        node.id,

                    timestamp:
                        Date.now(),

                    error:
                        message
                })


                emit({
                    type:
                        "run.failed",

                    runId,

                    timestamp:
                        Date.now(),

                    error:
                        message
                })


                return {
                    runId,

                    success: false,

                    envelopes,

                    events,

                    nodeStates
                }
            }
        }


        /*
         * Todo terminó correctamente.
         */

        emit({
            type:
                "run.completed",

            runId,

            timestamp:
                Date.now()
        })


        return {
            runId,

            success: true,

            envelopes,

            events,

            nodeStates
        }


    } catch (error) {

        /*
         * Errores del propio runtime:
         * ciclos, plan inválido, etc.
         */

        const message =
            error instanceof Error
                ? error.message
                : String(error)


        emit({
            type:
                "run.failed",

            runId,

            timestamp:
                Date.now(),

            error:
                message
        })


        return {
            runId,

            success: false,

            envelopes,

            events,

            nodeStates
        }
    }
}