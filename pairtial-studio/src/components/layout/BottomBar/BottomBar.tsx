import "./BottomBar.css"

import {
    useState
} from "react"

import type {
    RuntimeEvent
} from "../../../core/runtime/runtime.types"


type BottomBarProps = {
    events: RuntimeEvent[]
}


type BottomTab =
    | "execution"
    | "results"
    | "envelopes"
    | "costs"
    | "logs"


function BottomBar({
    events
}: BottomBarProps) {

    const [
        selectedTab,
        setSelectedTab
    ] = useState<BottomTab>("execution")


    return (
        <div id="BottomBar">

            <div id="BottomBarInner">

                <div id="BottomPanelLeftArea">

                    <div id="BottomPanelLeft">

                        <div id="BottomPanelLeftIn">

                            <div className="bottom-tabs">

                                <button
                                    className={
                                        selectedTab === "execution"
                                            ? "bottom-tab selected"
                                            : "bottom-tab"
                                    }
                                    onClick={() =>
                                        setSelectedTab("execution")
                                    }
                                >
                                    Ejecución
                                </button>


                                <button
                                    className={
                                        selectedTab === "results"
                                            ? "bottom-tab selected"
                                            : "bottom-tab"
                                    }
                                    onClick={() =>
                                        setSelectedTab("results")
                                    }
                                >
                                    Resultados
                                </button>


                                <button
                                    className={
                                        selectedTab === "envelopes"
                                            ? "bottom-tab selected"
                                            : "bottom-tab"
                                    }
                                    onClick={() =>
                                        setSelectedTab("envelopes")
                                    }
                                >
                                    Envelopes
                                </button>


                                <button
                                    className={
                                        selectedTab === "costs"
                                            ? "bottom-tab selected"
                                            : "bottom-tab"
                                    }
                                    onClick={() =>
                                        setSelectedTab("costs")
                                    }
                                >
                                    Costos
                                </button>


                                <button
                                    className={
                                        selectedTab === "logs"
                                            ? "bottom-tab selected"
                                            : "bottom-tab"
                                    }
                                    onClick={() =>
                                        setSelectedTab("logs")
                                    }
                                >
                                    Logs
                                </button>

                            </div>


                            <div className="bottom-content">

                                {selectedTab === "execution" && (
                                    <ExecutionView
                                        events={events}
                                    />
                                )}


                                {selectedTab === "results" && (
                                    <div className="bottom-placeholder">
                                        Resultados
                                    </div>
                                )}


                                {selectedTab === "envelopes" && (
                                    <div className="bottom-placeholder">
                                        Envelopes
                                    </div>
                                )}


                                {selectedTab === "costs" && (
                                    <div className="bottom-placeholder">
                                        Costos
                                    </div>
                                )}


                                {selectedTab === "logs" && (
                                    <div className="bottom-placeholder">
                                        Logs
                                    </div>
                                )}

                            </div>

                        </div>

                    </div>

                </div>


                <div id="BottomPanelRightArea">

                    <div id="BottomPanelRight">

                        <div id="BottomPanelRightIn">

                            {/* HEADER */}

                            <div className="fabric-detail-header">

                                <div className="fabric-detail-title">

                                    <div className="fabric-detail-icon">
                                        ◈
                                    </div>

                                    <strong>
                                        Fabric · Mathematics Collective
                                    </strong>

                                </div>


                                <div className="fabric-detail-status">

                                    <span className="fabric-status-badge">
                                        ◆ Completado
                                    </span>

                                    <span className="fabric-time-badge">
                                        3.4s
                                    </span>

                                </div>

                            </div>


                            {/* TABS */}

                            <div className="fabric-detail-tabs">

                                <button className="fabric-detail-tab selected">
                                    Detalles
                                </button>

                                <button className="fabric-detail-tab">
                                    Input
                                </button>

                                <button className="fabric-detail-tab">
                                    Output
                                </button>

                                <button className="fabric-detail-tab">
                                    Agentes (3)
                                </button>

                            </div>


                            {/* BODY */}

                            <div className="fabric-detail-content">

                                <div className="fabric-detail-data">

                                    <div className="fabric-detail-row">
                                        <span>
                                            Fabric
                                        </span>

                                        <strong>
                                            Mathematics Collective
                                        </strong>
                                    </div>


                                    <div className="fabric-detail-row">
                                        <span>
                                            Tiempo
                                        </span>

                                        <strong>
                                            3.4 segundos
                                        </strong>
                                    </div>


                                    <div className="fabric-detail-row">
                                        <span>
                                            Agentes
                                        </span>

                                        <strong>
                                            3
                                        </strong>
                                    </div>


                                    <div className="fabric-detail-row">
                                        <span>
                                            Envelopes generados
                                        </span>

                                        <strong>
                                            1
                                        </strong>
                                    </div>


                                    <div className="fabric-detail-row">
                                        <span>
                                            Costo estimado
                                        </span>

                                        <strong>
                                            $0.012
                                        </strong>
                                    </div>

                                </div>


                                <div className="fabric-detail-preview">

                                    <div className="fabric-preview-elevator">

                                        <div className="fabric-preview-top">
                                            ▲ ⚡
                                        </div>

                                        <div className="fabric-preview-door">

                                            <div className="fabric-preview-agent blue" />

                                            <div className="fabric-preview-agent purple" />

                                            <div className="fabric-preview-agent green" />

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* BUTTON */}

                            <button className="fabric-detail-open">
                                Abrir detalles de la Fabric

                                <span>
                                    →
                                </span>
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    )
}


type ExecutionViewProps = {
    events: RuntimeEvent[]
}


function ExecutionView({
    events
}: ExecutionViewProps) {

    if (
        events.length === 0
    ) {

        return (
            <div className="bottom-placeholder">
                No hay ejecución activa
            </div>
        )
    }


    return (
        <div className="execution-view">

            {events.map((
                event,
                index
            ) => {

                const time =
                    new Date(
                        event.timestamp
                    ).toLocaleTimeString()


                return (
                    <div
                        key={`${event.type}-${event.timestamp}-${index}`}
                        className="execution-row"
                    >

                        <span className="execution-time">
                            {time}
                        </span>


                        <div className="execution-line">

                            <span
                                className={
                                    `execution-dot ${getEventClass(event)}`
                                }
                            />

                        </div>


                        <strong className="execution-name">
                            {getEventName(event)}
                        </strong>


                        <span className="execution-message">
                            {getEventMessage(event)}
                        </span>

                    </div>
                )
            })}

        </div>
    )
}


function getEventClass(
    event: RuntimeEvent
) {

    switch (event.type) {

        case "run.started":
            return "input"

        case "node.started":
            return "api"

        case "envelope.created":
            return "fabric"

        case "node.completed":
            return "quality"

        case "node.failed":
        case "run.failed":
            return "error"

        case "run.completed":
            return "output"

        default:
            return ""
    }
}


function getEventName(
    event: RuntimeEvent
) {

    switch (event.type) {

        case "run.started":
            return "Sistema"

        case "run.completed":
            return "Sistema"

        case "run.failed":
            return "Sistema"

        case "node.started":
            return "Nodo"

        case "node.completed":
            return "Nodo"

        case "node.failed":
            return "Nodo"

        case "envelope.created":
            return "Envelope"

        default:
            return "Evento"
    }
}


function getEventMessage(
    event: RuntimeEvent
) {

    switch (event.type) {

        case "run.started":
            return "Ejecución iniciada"

        case "run.completed":
            return "Ejecución completada"

        case "run.failed":
            return `Ejecución fallida: ${event.error}`

        case "node.started":
            return `Ejecutando ${event.nodeId}`

        case "node.completed":
            return `Nodo ${event.nodeId} completado`

        case "node.failed":
            return `Error en ${event.nodeId}: ${event.error}`

        case "envelope.created":
            return `Envelope ${event.envelope.id} generado`

        default:
            return "Evento desconocido"
    }
}


export default BottomBar