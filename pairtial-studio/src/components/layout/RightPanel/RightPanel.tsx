import "./RightPanel.css"

import {
    useState
} from "react"

import { FabricsPanel } from "./FabricsPanel/FabricsPanel"
import { PropertiesPanel } from "./PropertiesPanel/PropertiesPanel"
import { SystemsPanel } from "./SystemsPanel/SystemsPanel"


type RightPanelTab =
    | "systems"
    | "fabrics"
    | "properties"


type RightPanelProps = {
    selectedPanel?: RightPanelTab
}


export default function RightPanel({
    selectedPanel = "systems"
}: RightPanelProps) {

    const [
        currentPanel,
        setCurrentPanel
    ] = useState<RightPanelTab>(
        selectedPanel
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
                                    setCurrentPanel("systems")
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
                                    setCurrentPanel("fabrics")
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
                                    setCurrentPanel("properties")
                                }
                            >
                                <span className="right-panelIn-btn-icon">
                                    ⚙
                                </span>

                                <span>
                                    Propiedades
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
                                <PropertiesPanel />
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