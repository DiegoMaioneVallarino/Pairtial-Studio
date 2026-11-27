import { createEnvelope } from '../envelope/createEnvelope'
import { abortableDelay } from '../runtime/abortableDelay'
import type { NodeExecutor } from './executor.types'

export const loopExecutor: NodeExecutor = async ({node, inputs, context}) => {
 const limit = Math.floor(Number(node.config.maxIterations))
 const target = Number(node.config.targetScore)
 let score = Number(node.config.initialScore)
 const history: number[] = []
 while (score < target && history.length < limit) {
  await abortableDelay(Number(node.config.iterationDelayMs), context.signal)
  score = Math.min(100, score + Number(node.config.scoreIncrement))
  history.push(score)
 }
 return createEnvelope({sourceNodeId:node.id,payload:{type:'loop', simulated:true, iterations:history.length, score, history, reached:score>=target, received:inputs.map(e=>e.payload)}})
}
export const deferredExecutor: NodeExecutor = async ({node, inputs, context}) => {
 await abortableDelay(Number(node.config.delayMs), context.signal)
 return createEnvelope({sourceNodeId:node.id,payload:inputs.length===1?inputs[0].payload:inputs.map(e=>e.payload)})
}
export const bestOfTwoExecutor: NodeExecutor = async ({node, inputs}) => {
 const a = inputs.filter(e=>e.targetPortId==='input')
 const b = inputs.filter(e=>e.targetPortId==='candidate-b')
 if(a.length!==1 || b.length!==1) throw new Error('Best of Two requires exactly one candidate on each port')
 const scoreA = Number(node.config.scoreA), scoreB = Number(node.config.scoreB)
 const winner = scoreA >= scoreB ? 'a' : 'b'
 return createEnvelope({sourceNodeId:node.id,payload:{type:'comparison',simulated:true,winner,scoreA,scoreB,selected:(winner==='a'?a[0]:b[0]).payload}})
}
