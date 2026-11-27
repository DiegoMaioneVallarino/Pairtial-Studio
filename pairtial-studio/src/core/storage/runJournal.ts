import type { PairtialSystem } from '../types/types'
import type { RuntimeResult } from '../runtime/runtime.types'
import type { DecisionRequest, DecisionResponse } from '../decisions/decisionManager'
import type { Artifact } from '../artifacts/artifactRegistry'
export type Checkpoint = RuntimeResult & { system: PairtialSystem; fabrics: PairtialSystem[]; maxConcurrency:number; database:[string,unknown][]; pending:Record<string,DecisionRequest>; responses:Record<string,DecisionResponse>; artifacts:Artifact[]; status:'running'|'completed'|'failed'|'cancelled'; updatedAt:number }
export class RunJournal {
 constructor(private storage: Pick<Storage,'getItem'|'setItem'>, private key='pairtial.runtime.v1') {}
 list():Checkpoint[]{ const raw=this.storage.getItem(this.key); if(!raw)return []; const data=JSON.parse(raw); if(data.version!==1||!Array.isArray(data.runs))throw new Error('Invalid runtime journal'); return data.runs }
 save(run:Checkpoint){const runs=this.list().filter(r=>r.runId!==run.runId); runs.unshift(run); this.storage.setItem(this.key,JSON.stringify({version:1,runs}))}
 latest(systemId:string){return this.list().find(r=>r.system.id===systemId)}
}
