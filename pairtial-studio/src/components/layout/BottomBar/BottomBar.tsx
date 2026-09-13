import "./BottomBar.css"

import {
    useState
} from "react"


type BottomTab =
    | "execution"
    | "results"
    | "envelopes"
    | "costs"
    | "logs"


function BottomBar() {

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
                                    <ExecutionView />
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


function ExecutionView() {

    const events = [
        {
            time: "20:12:01",
            type: "input",
            name: "Entrada",
            text: "Se recibió un archivo: sprite.png (420 KB)"
        },
        {
            time: "20:12:03",
            type: "api",
            name: "Agente API",
            text: "Consultando API de colores..."
        },
        {
            time: "20:12:07",
            type: "fabric",
            name: "Fabric",
            text: "3 agentes procesando la solicitud..."
        },
        {
            time: "20:12:15",
            type: "quality",
            name: "Revisor QA",
            text: "Resultado validado • calidad: 92%"
        },
        {
            time: "20:12:16",
            type: "output",
            name: "Salida",
            text: "Envelope enviado al usuario"
        }
    ]


    return (
        <div className="execution-view">

            {events.map((
                event,
                index
            ) => (

                <div
                    key={index}
                    className="execution-row"
                >

                    <span className="execution-time">
                        {event.time}
                    </span>


                    <div className="execution-line">

                        <span
                            className={
                                `execution-dot ${event.type}`
                            }
                        />

                    </div>


                    <strong className="execution-name">
                        {event.name}
                    </strong>


                    <span className="execution-message">
                        {event.text}
                    </span>

                </div>

            ))}

        </div>
    )

}


export default BottomBar