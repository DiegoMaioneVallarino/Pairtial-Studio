import "./FabricsPanel.css"
import { useSystemStore } from "../../../../stores/systemStore"
export function FabricsPanel() {
 const systems = useSystemStore(s=>s.systems)
 const activeId = useSystemStore(s=>s.activeSystemId)
 const select = useSystemStore(s=>s.selectSystem)
 return <aside className="fabrics-panel"><h3>Fabrics</h3><p>Inserta Factory desde la barra izquierda y selecciona un sistema en Propiedades.</p>{systems.filter(s=>s.id!==activeId).map(s=><div key={s.id} style={{padding:12,borderBottom:"1px solid #8884"}}><strong>{s.name}</strong><p>{s.nodes.length} nodos · {s.edges.length} conexiones</p><button onClick={()=>select(s.id)}>Editar sistema</button></div>)}</aside>
}
export default FabricsPanel
