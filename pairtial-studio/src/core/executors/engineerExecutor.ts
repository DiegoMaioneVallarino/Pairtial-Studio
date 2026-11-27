import { createEnvelope } from "../envelope/createEnvelope"
import { artifactDependencies, type ArtifactKind } from "../artifacts/artifactRegistry"
import type { NodeExecutor } from "./executor.types"
export const engineerExecutor: NodeExecutor = async ({node,inputs,context}) => {
 const kind=String(node.config.artifactKind) as ArtifactKind
 const language=String(node.config.language)
 const content=String(node.config.content || "// Código simulado generado por Engineer")
 const name=String(node.config.artifactName || node.name)
 const id=String(node.config.artifactId || "") || undefined
 context.signal.throwIfAborted()
 const artifact=context.artifacts.publish({id,kind,name,mimeType:kind==='json'?'application/json':'text/plain',content,encoding:'utf8',runId:context.runId,nodeId:node.id,systemId:context.system.id,dependencies:artifactDependencies(inputs)})
 return {...createEnvelope({sourceNodeId:node.id,payload:{type:"engineering",status:"completed",instructions:node.config.instructions,language,artifact,received:inputs.map(e=>e.payload)}}),artifacts:[artifact]}
}
