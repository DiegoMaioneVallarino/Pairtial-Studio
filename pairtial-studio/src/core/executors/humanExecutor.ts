import {createEnvelope} from '../envelope/createEnvelope'
import type {NodeExecutor} from './executor.types'
import type {DecisionRequest} from '../decisions/decisionManager'
export const humanExecutor:NodeExecutor=async ({node,inputs,context})=>{
 const response=await context.requestDecision({runId:context.runId,nodeId:node.id,title:node.name,prompt:String(node.config.prompt),mode:node.config.mode as DecisionRequest['mode'],choices:String(node.config.choices).split('\n').map(x=>x.trim()).filter(Boolean),inputs:inputs.map(x=>x.payload)})
 return createEnvelope({sourceNodeId:node.id,payload:{type:'human-decision',decision:response.action,value:response.value,feedback:response.feedback,received:inputs.map(x=>x.payload)}})
}
