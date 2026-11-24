import { getConfig } from "../config/nodeConfig"
import { abortableDelay } from "../runtime/abortableDelay"
import type { NodeExecutor } from "./executor.types"
export function withMockConfig(executor: NodeExecutor): NodeExecutor {
 return async input => {
  const config = getConfig(input.node.kind, input.node.config)
  const started = performance.now()
  await abortableDelay(Number(config.latencyMs), input.context.signal)
  if (Math.random() * 100 < Number(config.failureRate)) throw new Error("Fallo simulado configurado")
  const output = await executor({...input, node: {...input.node, config}})
  input.context.signal.throwIfAborted()
  return {...output, metadata: {...output.metadata, durationMs: performance.now()-started, tokens: Math.min(Number(config.simulatedTokens), Number(config.maxTokens ?? Infinity)), cost: Number(config.simulatedCost)}}
 }
}
