import "./ExecutionPanel.css"

import type {
    Node
} from "@xyflow/react"

import type {
    RuntimeEvent
} from "../../../../core/runtime/runtime.types"


type ExecutionPanelProps = {
    node: Node | null
    events: RuntimeEvent[]
}


export function ExecutionPanel({
    node,
    events
}: ExecutionPanelProps) {

    if (!node) {
        return (
            <div className="execution-panel">

                <div className="execution-empty">
                    Selecciona un nodo para inspeccionar su ejecución.
                </div>

            </div>
        )
    }


    const nodeEvents =
        events.filter(
            event =>
                "nodeId" in event &&
                event.nodeId === node.id
        )


const inputEvents =
    nodeEvents.filter(
        event =>
            event.type === "envelope.received"
    )

    const startedEvent =
        nodeEvents.find(
            event =>
                event.type ===
                "node.started"
        )


    const completedEvent =
        [...nodeEvents]
            .reverse()
            .find(
                event =>
                    event.type ===
                        "node.completed" ||
                    event.type ===
                        "node.failed"
            )


    const outputEvent =
        [...nodeEvents]
            .reverse()
            .find(
                event =>
                    event.type ===
                    "envelope.created"
            )


    let status =
        "idle"

    if (startedEvent) {
        status =
            completedEvent
                ? completedEvent.type ===
                    "node.failed"
                    ? "error"
                    : "success"
                : "running"
    }


    const duration =
        startedEvent &&
        completedEvent
            ? completedEvent.timestamp -
              startedEvent.timestamp
            : null


    const runId =
        nodeEvents[0]?.runId


    const output =
        outputEvent?.type ===
        "envelope.created"
            ? outputEvent.envelope
            : null


    return (
        <div className="execution-panel">

            <div className="execution-summary">

                <div className="execution-row">

                    <span>
                        Status
                    </span>

                    <strong
                        className={
                            `execution-status execution-status-${status}`
                        }
                    >
                        {status}
                    </strong>

                </div>


                <div className="execution-row">

                    <span>
                        Run
                    </span>

                    <code>
                        {
                            runId
                                ? runId.slice(0, 8)
                                : "—"
                        }
                    </code>

                </div>


                <div className="execution-row">

                    <span>
                        Duration
                    </span>

                    <strong>
                        {
                            duration !== null
                                ? `${duration} ms`
                                : "—"
                        }
                    </strong>

                </div>

            </div>

<section className="execution-section">

    <h4>Input Envelopes</h4>

    {inputEvents.length === 0 ? (
        <div className="execution-muted">
            No input envelopes
        </div>
    ) : (
        inputEvents.map(event => (
            <div
                key={event.envelope.id}
                className="execution-input"
            >
                <div className="execution-input-header">
                    <span>Source</span>
                    <code>
                        {event.envelope.sourceNodeId}
                    </code>
                </div>

                <pre className="execution-payload">
                    {JSON.stringify(
                        event.envelope.payload,
                        null,
                        2
                    )}
                </pre>
            </div>
        ))
    )}

</section>


            <section className="execution-section">

                <h4>
                    Output
                </h4>

                {
                    output
                        ? (
                            <pre className="execution-payload">
                                {
                                    JSON.stringify(
                                        output.payload,
                                        null,
                                        2
                                    )
                                }
                            </pre>
                        )
                        : (
                            <div className="execution-muted">
                                No output
                            </div>
                        )
                }

            </section>


            <section className="execution-section">

                <h4>
                    Envelope
                </h4>

                {
                    output
                        ? (
                            <div className="execution-envelope">

                                <div>
                                    <span>ID</span>

                                    <code>
                                        {
                                            output.id.slice(
                                                0,
                                                8
                                            )
                                        }
                                    </code>
                                </div>


                                <div>
                                    <span>Source</span>

                                    <code>
                                        {
                                            output.sourceNodeId
                                        }
                                    </code>
                                </div>


                                {
                                    output.metadata && (

                                        <pre className="execution-metadata">
                                            {
                                                JSON.stringify(
                                                    output.metadata,
                                                    null,
                                                    2
                                                )
                                            }
                                        </pre>

                                    )
                                }

                            </div>
                        )
                        : (
                            <div className="execution-muted">
                                No envelope
                            </div>
                        )
                }

            </section>


            <section className="execution-section">

                <h4>
                    Events
                </h4>

                <div className="execution-events">

                    {
                        nodeEvents.length === 0
                            ? (
                                <div className="execution-muted">
                                    Este nodo todavía no se ha ejecutado.
                                </div>
                            )
                            : nodeEvents.map(
                                (
                                    event,
                                    index
                                ) => (

                                    <div
                                        key={
                                            `${event.type}-${event.timestamp}-${index}`
                                        }
                                        className="execution-event"
                                    >

                                        <span
                                            className={
                                                `execution-event-dot execution-event-${event.type.replace(".", "-")}`
                                            }
                                        />

                                        <span>
                                            {event.type}
                                        </span>

                                    </div>

                                )
                            )
                    }

                </div>

            </section>

        </div>
    )
}


export default ExecutionPanel