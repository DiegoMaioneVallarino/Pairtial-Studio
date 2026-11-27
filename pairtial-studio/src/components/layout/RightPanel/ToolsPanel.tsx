import { useState } from 'react'
import { createToolRegistry } from '../../../core/tools/toolRegistry'
export function ToolsPanel(){
 const [query,setQuery]=useState('')
 return <section className="Properties-panel" style={{padding:12,overflow:'auto'}}><h3>Tool Registry</h3><input aria-label="Buscar herramientas" placeholder="Buscar herramienta" value={query} onChange={e=>setQuery(e.target.value)}/>{createToolRegistry().list().filter(t=>`${t.id} ${t.name}`.toLowerCase().includes(query.toLowerCase())).map(t=><details key={t.id} style={{marginTop:12}}><summary>{t.name}</summary><p>{t.id}</p><small>{t.permission}</small><pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify({input:t.input,output:t.output},null,2)}</pre></details>)}</section>
}
