import { useState } from 'react'
import type { Artifact } from '../../../core/artifacts/artifactRegistry'
export function ArtifactsPanel({artifacts}:{artifacts:Artifact[]}) {
 const [query,setQuery]=useState('')
 const [selected,setSelected]=useState('')
 const item=artifacts.find(a=>`${a.id}:${a.version}`===selected)
 function download(a:Artifact) {
  const data=a.encoding==='base64'?Uint8Array.from(atob(a.content),c=>c.charCodeAt(0)):a.content
  const url=URL.createObjectURL(new Blob([data],{type:a.mimeType})); const link=document.createElement('a');link.href=url;link.download=a.name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
 }
 return <section style={{padding:12,overflow:'auto',height:'100%',fontSize:12}}><h3>Artifact Registry ({artifacts.length})</h3><input aria-label="Buscar artefactos" placeholder="Buscar..." value={query} onChange={e=>setQuery(e.target.value)} style={{width:'100%'}}/>{artifacts.filter(a=>`${a.name} ${a.kind} ${a.id}`.toLowerCase().includes(query.toLowerCase())).slice().reverse().map(a=><button key={`${a.id}:${a.version}`} onClick={()=>setSelected(`${a.id}:${a.version}`)} style={{display:'block',width:'100%',textAlign:'left',padding:8,marginTop:4}}>{a.name} · v{a.version} · {a.kind} · {a.size} B</button>)}{item&&<div><h4>{item.name} · v{item.version}</h4><p style={{overflowWrap:'anywhere'}}>ID: {item.id}</p><p>Run: {item.runId}</p><p>Dependencias: {item.dependencies.length}</p><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{item.encoding==='utf8'?item.content:'Recurso binario'}</pre><button onClick={()=>download(item)}>Descargar</button></div>}</section>
}
