import {useState} from 'react'
import type {DecisionRequest,DecisionResponse} from '../../core/decisions/decisionManager'
import './DecisionInbox.css'
function RequestCard({request,manager}:{request:DecisionRequest;manager:{respond:(id:string,response:DecisionResponse)=>boolean|Promise<boolean>}}){
 const [value,setValue]=useState(''),[feedback,setFeedback]=useState(''),[error,setError]=useState('')
 const respond=async(action:DecisionResponse['action'])=>{if(!await manager.respond(request.id,{action,value,feedback}))setError('Respuesta inválida o solicitud cerrada')}
 return <section><strong>{request.title}</strong><p>{request.prompt}</p><details><summary>Entradas recibidas</summary><pre>{JSON.stringify(request.inputs,null,2)}</pre></details>
 {request.mode==='selection'?<select value={value} onChange={e=>setValue(e.target.value)}><option value="">Seleccionar...</option>{request.choices.map((x,i)=><option key={i}>{x}</option>)}</select>:request.mode!=='approval'?<input type={request.mode==='parameter'?'number':'text'} value={value} onChange={e=>setValue(e.target.value)} placeholder="Respuesta"/>:null}
 <textarea value={feedback} onChange={e=>setFeedback(e.target.value)} placeholder="Comentarios"/><div className="decision-actions"><button onClick={()=>respond('rejected')}>Rechazar</button><button onClick={()=>respond('revise')}>Revisar</button><button onClick={()=>respond('approved')}>Aprobar</button></div>{error&&<p role="alert">{error}</p>}</section>
}
export default function DecisionInbox({requests,manager}:{requests:DecisionRequest[];manager:{respond:(id:string,response:DecisionResponse)=>boolean|Promise<boolean>}}){return requests.length?<aside className="decision-inbox"><h3>Human decisions · {requests.length}</h3>{requests.map(r=><RequestCard key={r.id} request={r} manager={manager}/>)}</aside>:null}
