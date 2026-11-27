import type { RuntimeOptions, RuntimeResult } from '../runtime/runtime.types'
import type { PairtialSystem } from '../types/types'
import type { Checkpoint } from '../storage/runJournal'
import type { DecisionRequest, DecisionResponse } from '../decisions/decisionManager'
const base='http://127.0.0.1:4317/api'
export async function serverRequest<T>(path:string,body?:unknown):Promise<T>{const r=await fetch(base+path,body===undefined?undefined:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error(await r.text());return r.json() as Promise<T>}
export const remoteDecisions={respond:(id:string,response:DecisionResponse)=>serverRequest(`/decisions/${encodeURIComponent(id)}/respond`,response).then(()=>true,()=>false)}
export async function runRemote(system:PairtialSystem,options:RuntimeOptions):Promise<RuntimeResult>{
 const {runId}=await serverRequest<{runId:string}>(options.checkpoint?`/runs/${options.checkpoint.runId}/resume`:'/runs',options.checkpoint?{}:{system,fabrics:options.fabrics,maxConcurrency:options.maxConcurrency});
 let cursor=options.checkpoint?.events.length??0;let cancelled=false;
 const cancel=()=>{if(!cancelled){cancelled=true;void serverRequest(`/runs/${runId}/cancel`,{}).catch(console.error)}};
 options.signal?.addEventListener('abort',cancel,{once:true});if(options.signal?.aborted)cancel();
 try{while(true){const cp=await serverRequest<Checkpoint>(`/runs/${runId}`);options.onCheckpoint?.(cp);options.artifacts?.restore(cp.artifacts);for(const event of cp.events.slice(cursor))options.onEvent?.(event);cursor=cp.events.length;if(cp.status!=='running')return cp;await new Promise(r=>setTimeout(r,500));}}finally{options.signal?.removeEventListener('abort',cancel)}
}
export const listRemoteRuns=()=>serverRequest<Checkpoint[]>('/runs')
export const listRemoteDecisions=()=>serverRequest<DecisionRequest[]>('/decisions')
