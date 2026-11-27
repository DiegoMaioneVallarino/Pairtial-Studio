export type DecisionRequest = { id: string; runId: string; nodeId: string; title: string; prompt: string; mode: 'approval'|'selection'|'instruction'|'parameter'; choices: string[]; inputs: unknown[]; createdAt: number }
export type DecisionResponse = { action: 'approved'|'rejected'|'revise'; value: string; feedback: string }
export class DecisionManager {
 private pending = new Map<string,{request:DecisionRequest; resolve:(r:DecisionResponse)=>void}>()
 constructor(private changed:(requests:DecisionRequest[])=>void = ()=>{}) {}
 list(){return [...this.pending.values()].map(x=>x.request)}
 request(data: Omit<DecisionRequest,'id'|'createdAt'>, signal:AbortSignal, existing?:DecisionRequest, beforeResolve?:(response:DecisionResponse)=>void):Promise<DecisionResponse>{
  signal.throwIfAborted()
  const request=existing??{...data,id:crypto.randomUUID(),createdAt:Date.now()}
  return new Promise((resolve,reject)=>{
   const cleanup=()=>{signal.removeEventListener('abort',abort);this.pending.delete(request.id);this.changed(this.list())}
   const abort=()=>{cleanup();reject(signal.reason??new DOMException('Cancelled','AbortError'))}
   this.pending.set(request.id,{request,resolve:r=>{beforeResolve?.(r);cleanup();resolve(r)}})
   signal.addEventListener('abort',abort,{once:true});this.changed(this.list())
  })
 }
 respond(id:string,response:DecisionResponse){
  const entry=this.pending.get(id);if(!entry) return false
  if(!['approved','rejected','revise'].includes(response.action)||typeof response.value!=='string'||typeof response.feedback!=='string') return false
  if(response.action==='approved'){
   if(entry.request.mode==='selection'&&!entry.request.choices.includes(response.value))return false
   if(entry.request.mode==='instruction'&&!response.value.trim())return false
   if(entry.request.mode==='parameter'&&(!response.value.trim()||!Number.isFinite(Number(response.value))))return false
  }
  entry.resolve({...response});return true
 }
}
