export type ArtifactKind = 'code'|'document'|'plan'|'json'|'image'|'audio'|'sprite'|'animation'
export type ArtifactReference = { id:string; version:number; kind:ArtifactKind; name:string; mimeType:string; size:number }
export type Artifact = ArtifactReference & { content:string; encoding:'utf8'|'base64'; createdAt:number; runId:string; nodeId:string; systemId:string; dependencies:ArtifactReference[] }
export type ArtifactInput = Omit<Artifact,'id'|'version'|'createdAt'|'size'> & { id?:string }
export class ArtifactRegistry {
 private records: Artifact[] = []
 constructor(private changed?: (records:Artifact[])=>void, initial:Artifact[] = []) { this.records=structuredClone(initial) }
 restore(records:Artifact[]){ for(const record of records) if(!this.get(record.id,record.version)) this.records.push(structuredClone(record)); this.changed?.(this.list()) }
 list():Artifact[] { return structuredClone(this.records) }
 get(id:string,version?:number):Artifact|undefined { const record=this.records.filter(a=>a.id===id && (version===undefined||a.version===version)).at(-1); return record && structuredClone(record) }
 publish(input:ArtifactInput):ArtifactReference {
  const previous=input.id ? this.get(input.id):undefined
  if(input.id && !previous) throw new Error('Unknown artifact')
  if(previous && (previous.kind!==input.kind || previous.systemId!==input.systemId)) throw new Error('Incompatible artifact revision')
  for(const dep of input.dependencies) if(!this.get(dep.id,dep.version)) throw new Error('Unknown artifact dependency')
  const size=input.encoding==='base64'?atob(input.content).length:new TextEncoder().encode(input.content).length
  const record:Artifact={...structuredClone(input),id:previous?.id??crypto.randomUUID(),version:(previous?.version??0)+1,createdAt:Date.now(),size}
  this.records.push(record); this.changed?.(this.list())
  return {id:record.id,version:record.version,kind:record.kind,name:record.name,mimeType:record.mimeType,size}
 }
}
export function artifactDependencies(inputs: {artifacts?:ArtifactReference[]}[]):ArtifactReference[] {
 const refs=inputs.flatMap(e=>e.artifacts??[]); return [...new Map(refs.map(r=>[`${r.id}:${r.version}`,r])).values()]
}
