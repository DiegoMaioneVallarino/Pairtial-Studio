import type { NodeProps } from '@xyflow/react'
import type { NodeExecutionState } from '../../core/types/types'
import AgentShell from './AgentShell/AgentShell'
function makeNode(kind: string, name: string, glyph: string) {
 return function IterationNode({data}: NodeProps) {
  return <AgentShell kind={kind} name={String(data.name??name)} description={String(data.description??'')} color="purple" executionState={data.executionState as NodeExecutionState|undefined} icon={<svg viewBox="0 0 24 24"><text x="12" y="18" textAnchor="middle" fontSize="20" fill="currentColor">{glyph}</text></svg>}/>
 }
}
export const HumanNode = makeNode("human","Human","♙")
export const FabricNode = makeNode("fabric","Fabric","⌘")
export const LoopNode = makeNode('loop','Loop','↻')
export const DeferredNode = makeNode('deferred','Deferred','◷')
export const BestOfTwoNode = makeNode('best-of-two','Best of Two','⇄')
