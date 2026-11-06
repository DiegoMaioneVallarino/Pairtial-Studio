import "./RightPanel.css"

import {
    useState
} from "react"

import type {
    Node
} from "@xyflow/react"

import {
    FabricsPanel
} from "./FabricsPanel/FabricsPanel"

import {
    PropertiesPanel
} from "./PropertiesPanel/PropertiesPanel"

import {
    SystemsPanel
} from "./SystemsPanel/SystemsPanel"


import ExecutionPanel from "./ExecutionPanel/ExecutionPanel"

import type {
    RuntimeEvent
} from "../../../core/runtime/runtime.types"

type RightPanelTab =
    | "systems"
    | "fabrics"
    | "properties"
    | "execution"

type RightPanelProps = {
    selectedPanel?: RightPanelTab

    selectedNode: Node | null

    runtimeEvents:
        RuntimeEvent[]

    onUpdateNode: (
        data: Record<string, unknown>
    ) => void
}


export function RightPanel({
    selectedPanel,
    selectedNode,
    runtimeEvents,
    onUpdateNode
}: RightPanelProps) {

    const [
        currentPanel,
        setCurrentPanel
    ] = useState<RightPanelTab>(
        selectedPanel ?? "properties"
    )


    return (
        <aside className="right-panel">

            <div className="right-top">

                <div className="right-panelIn">

                    <div className="right-panelInArea">

                        <div className="right-panelIn-btn-section">

                            <button
                                className={
                                    `right-panelIn-btn ${
                                        currentPanel === "systems"
                                            ? "selected"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    setCurrentPanel(
                                        "systems"
                                    )
                                }
                            >
                                <span className="right-panelIn-btn-icon">
                                    ⬡
                                </span>

                                <span>
                                    Sistemas
                                </span>
                            </button>


                            <button
                                className={
                                    `right-panelIn-btn ${
                                        currentPanel === "fabrics"
                                            ? "selected"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    setCurrentPanel(
                                        "fabrics"
                                    )
                                }
                            >
                                <span className="right-panelIn-btn-icon">
                                    ⌘
                                </span>

                                <span>
                                    Fabrics
                                </span>
                            </button>


                            <button
                                className={
                                    `right-panelIn-btn ${
                                        currentPanel === "properties"
                                            ? "selected"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    setCurrentPanel(
                                        "properties"
                                    )
                                }
                            >
                                <span className="right-panelIn-btn-icon">
                                    ⚙
                                </span>

                                <span>
                                    Propiedades
                                </span>
                            </button>
                        <button
                            className={
                                `right-panelIn-btn ${
                                    currentPanel === "execution"
                                        ? "selected"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                setCurrentPanel(
                                    "execution"
                                )
                            }
                        >
                            <span className="right-panelIn-btn-icon">
                                ▶
                            </span>

                            <span>
                                Ejecución
                            </span>
                        </button>
                        </div>


                        <div className="right-panel-content">

                            {currentPanel === "systems" && (
                                <SystemsPanel />
                            )}


                            {currentPanel === "fabrics" && (
                                <FabricsPanel />
                            )}


                            {currentPanel === "properties" && (
                                <PropertiesPanel
                                    node={
                                        selectedNode
                                    }
                                    onUpdate={
                                        onUpdateNode
                                    }
                                />
                            )}

                        </div>

                    </div>

                </div>

            </div>


            <div className="right-bottom">

                <div className="right-bottomIn">

                    <div className="right-bottomInArea">

                        <span className="right-bottom-title">
                            Vista previa
                        </span>

                    </div>

                </div>

            </div>

        </aside>
    )
}

export default RightPanel