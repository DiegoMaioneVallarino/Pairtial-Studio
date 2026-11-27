import type { NodeKind } from '../types/types'
export type PortType = 'any' | 'text' | 'json' | 'quality' | 'artifact' | 'decision' | 'assignment' | 'record' | 'number'
export type Port = { id: string; label: string; type: PortType }
const p = (id: string, label: string, type: PortType = 'any'): Port => ({id,label,type})
const input = p('input','Input')
const out = (type: PortType) => p('output','Output',type)
export function getPorts(kind: NodeKind | string): { inputs: Port[]; outputs: Port[] } {
 switch(kind) {
  case 'loop': return {inputs:[input],outputs:[out('json'),p('reached','Reached','json'),p('exhausted','Exhausted','json')]}
  case 'best-of-two': return {inputs:[p('input','Candidate A'),p('candidate-b','Candidate B')],outputs:[out('json'),p('a','Winner A','json'),p('b','Winner B','json')]}
  case 'deferred': return {inputs:[input],outputs:[out('any')]}
  case 'agent': return {inputs:[input,p('context','Context')],outputs:[out('text')]}
  case 'api': return {inputs:[input],outputs:[out('json')]}
  case 'quality': return {inputs:[input,p('context','Context')],outputs:[out('quality'),p('score','Score','number'),p('passed','Passed','quality'),p('rejected','Rejected','quality')]}
  case 'engineer': return {inputs:[input,p('context','Context')],outputs:[out('artifact')]}
  case 'supervisor': return {inputs:[input,p('evaluation','Evaluation','quality')],outputs:[out('decision'),p('approved','Approved','decision'),p('revise','Revise','decision'),p('rejected','Rejected','decision')]}
  case 'hr': return {inputs:[input],outputs:[out('assignment')]}
  case 'db': return {inputs:[input],outputs:[out('record')]}
  case 'king': return {inputs:[input,p('decision','Decision','decision')],outputs:[out('decision'),p('approved','Approved','decision'),p('revise','Revise','decision'),p('rejected','Rejected','decision')]}
  default: return {inputs:[input],outputs:[out('any')]}
 }
}
export function connectionError(source: string, target: string, sourcePort?: string | null, targetPort?: string | null): string | undefined {
 const a = getPorts(source).outputs.find(p => p.id === (sourcePort ?? 'output'))
 const b = getPorts(target).inputs.find(p => p.id === (targetPort ?? 'input'))
 if (!a || !b) return 'Unknown port'
 if (a.type !== b.type && a.type !== 'any' && b.type !== 'any') return `Incompatible ports: ${a.type} → ${b.type}`
}
