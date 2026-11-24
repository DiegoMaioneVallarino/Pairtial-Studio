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

                {node.type === "db" && <>
                    <div className="properties-field"><label>Operación</label><select value={String(node.data.operation ?? "write")} onChange={e => onUpdate({ operation: e.target.value })}>{["write", "read", "update", "delete", "search"].map(op => <option key={op}>{op}</option>)}</select></div>
                    <div className="properties-field"><label>Clave</label><input value={String(node.data.key ?? "result")} onChange={e => onUpdate({ key: e.target.value })} /></div>
                    <div className="properties-field"><label>Valor (vacío = entradas)</label><textarea value={String(node.data.value ?? "")} onChange={e => onUpdate({ value: e.target.value })} /></div>
                </>}
                {node.type === "king" && <>
                    <div className="properties-field"><label>Objetivo</label><textarea value={String(node.data.objective ?? "Evaluar resultados")} onChange={e => onUpdate({ objective: e.target.value })} /></div>
                    <div className="properties-field"><label>Decisión simulada</label><select value={String(node.data.decision ?? "approve")} onChange={e => onUpdate({ decision: e.target.value })}>{["approve", "revise", "reject"].map(op => <option key={op}>{op}</option>)}</select></div>
                </>}
            </div>

        </aside>
    )
}


export default PropertiesPanel