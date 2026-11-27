import type { NodeExecutor } from "./executor.types"
import { createEnvelope } from "../envelope/createEnvelope"
export const fabricExecutor: NodeExecutor = async ({node, inputs, context}) => {
 const id = String(node.config.fabricId ?? "")
 const result = await context.runFabric(id, inputs)
 context.signal.throwIfAborted()
 if (!result.success) {
  const failure = result.events.find(e => e.type === "run.failed")
  throw new Error(failure?.type === "run.failed" ? failure.error : "Fabric failed")
 }
 const delivered = new Set(result.events.filter(e => e.type === "envelope.received").map(e => e.type === "envelope.received" ? e.envelope.id : ""))
 const outputs = result.envelopes.filter(e => e.sourcePortId === "output" && !delivered.has(e.id))
 return createEnvelope({sourceNodeId:node.id,payload:{type:"fabric",fabricId:id,runId:result.runId,outputs:outputs.map(e=>({nodeId:e.sourceNodeId,payload:e.payload})),nodeStates:result.nodeStates,events:result.events}})
}
