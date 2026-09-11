import "./RightPanel.css"
import { FabricsPanel } from "./FabricsPanel/FabricsPanel"
import { ModelsPanel } from "./ModelsPanel/ModelsPanel"
import { PropertiesPanel } from "./PropertiesPanel/PropertiesPanel"

type RightPanelTab =
    | "properties"
    | "fabrics"
    | "models"

type RightPanelProps = {
    selectedPanel:RightPanelTab
}

export default function RightPanel({
    selectedPanel
}: RightPanelProps) {

    return (
        <aside className="right-panel">

            {selectedPanel === "properties" && (
                <PropertiesPanel />
            )}

            {selectedPanel === "fabrics" && (
                <FabricsPanel />
            )}

            {selectedPanel === "models" && (
                <ModelsPanel />
            )}

        </aside>
    )
}