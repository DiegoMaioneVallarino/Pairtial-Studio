import "./PropertiesPanel.css"
import { useSystemStore } from "../../../../stores/systemStore"
import type { Node } from "@xyflow/react"
import type { NodeKind } from "../../../../core/types/types"
import { nodeFields, simulationFields, getConfig } from "../../../../core/config/nodeConfig"
import type { Field } from "../../../../core/config/nodeConfig"

type PropertiesPanelProps = { node: Node | null; onUpdate: (data: Record<string, unknown>) => void }
export function PropertiesPanel({node, onUpdate}: PropertiesPanelProps) {
 const systems = useSystemStore(s=>s.systems)
 const activeId = useSystemStore(s=>s.activeSystemId)
 if (!node) return <aside className="Properties-panel"><h3>Propiedades</h3><div className="properties-empty">Selecciona un nodo para editar sus propiedades.</div></aside>
 const kind = node.type as NodeKind
 const config = getConfig(kind, node.data)
 function renderField(f: Field) {
  const id = `property-${f.key}`
  const value = String(config[f.key] ?? f.defaultValue)
  return <div className="properties-field" key={f.key}>
   <label htmlFor={id}>{f.label}</label>
   {f.kind === "select" ? <select id={id} value={value} onChange={e=>onUpdate({[f.key]:e.target.value})}>{f.options?.map(option=><option key={option}>{option}</option>)}</select> : f.kind === "textarea" ? <textarea id={id} rows={3} value={value} onChange={e=>onUpdate({[f.key]:e.target.value})}/> : f.kind === "number" ? <input id={id} type="number" min={f.min} max={f.max} step={f.step} value={value} onChange={e=>{const n=e.target.valueAsNumber; if(Number.isFinite(n)) onUpdate({[f.key]:n})}} onBlur={()=>onUpdate({[f.key]:config[f.key]})}/> : <input id={id} value={value} onChange={e=>onUpdate({[f.key]:e.target.value})}/>}
  </div>
 }
 return <aside className="Properties-panel">
  <h3>Propiedades</h3>
  <div className="properties-section">
   <div className="properties-field"><label>Tipo</label><div className="properties-readonly">{kind}</div></div>
   <div className="properties-field"><label htmlFor="node-name">Nombre</label><input id="node-name" value={String(node.data.name ?? "")} onChange={e=>onUpdate({name:e.target.value})}/></div>
   <div className="properties-field"><label htmlFor="node-description">Descripción</label><textarea id="node-description" rows={3} value={String(node.data.description ?? "")} onChange={e=>onUpdate({description:e.target.value})}/></div>
   <h4>Configuración del nodo</h4>
   {kind === "fabric" ? <div className="properties-field"><label htmlFor="fabric-id">Sistema reutilizable</label><select id="fabric-id" value={String(node.data.fabricId ?? "")} onChange={e=>onUpdate({fabricId:e.target.value})}><option value="">Seleccionar sistema</option>{systems.filter(s=>s.id!==activeId).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><small>Las entradas se entregan a los nodos raíz del sistema.</small></div> : (nodeFields[kind] ?? []).map(renderField)}
   <h4>Simulación local</h4>
   <small>Sin llamadas externas. Tokens y costes son ficticios.</small>
   {simulationFields(kind).map(renderField)}
  </div>
 </aside>
}
export default PropertiesPanel
