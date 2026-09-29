import "./PropertiesPanel.css"

import type {
    Node
} from "@xyflow/react"


type PropertiesPanelProps = {

    node:
        Node | null

    onUpdate: (
        data: Record<string, unknown>
    ) => void

}


type NodeData = {
    name?: string
    description?: string
}


export function PropertiesPanel({
    node,
    onUpdate
}: PropertiesPanelProps) {

    if (!node) {

        return (
            <aside className="Properties-panel">

                <h3>
                    Propiedades
                </h3>

                <div className="properties-empty">
                    Selecciona un nodo para editar sus propiedades.
                </div>

            </aside>
        )
    }


    const data =
        node.data as NodeData


    return (
        <aside className="Properties-panel">

            <h3>
                Propiedades
            </h3>


            <div className="properties-section">

                <div className="properties-field">

                    <label>
                        Tipo
                    </label>

                    <div className="properties-readonly">
                        {node.type ?? "unknown"}
                    </div>

                </div>


                <div className="properties-field">

                    <label htmlFor="node-name">
                        Nombre
                    </label>

                    <input
                        id="node-name"
                        type="text"
                        value={
                            data.name ?? ""
                        }
                        onChange={
                            event =>
                                onUpdate({
                                    name:
                                        event.target.value
                                })
                        }
                    />

                </div>


                <div className="properties-field">

                    <label htmlFor="node-description">
                        Descripción
                    </label>

                    <textarea
                        id="node-description"
                        value={
                            data.description ?? ""
                        }
                        onChange={
                            event =>
                                onUpdate({
                                    description:
                                        event.target.value
                                })
                        }
                        rows={4}
                    />

                </div>

            </div>

        </aside>
    )
}


export default PropertiesPanel