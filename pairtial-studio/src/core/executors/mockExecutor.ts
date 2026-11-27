import { getConfig } from "../config/nodeConfig"
import { abortableDelay } from "../runtime/abortableDelay"
import type { NodeExecutor } from "./executor.types"
export function withMockConfig(executor: NodeExecutor): NodeExecutor {
 return async input => {
  const config = getConfig(input.node.kind, input.node.config)
  const started = performance.now()
  let attempts = 0
  while (true) {
   attempts++
   await abortableDelay(Number(config.latencyMs), input.context.signal)
   if (Math.random() * 100 >= Number(config.failureRate)) break
   if (attempts > Math.floor(Number(config.maxRetries))) throw new Error(`Fallo simulado tras ${attempts} intentos`)
   await abortableDelay(Number(config.retryDelayMs), input.context.signal)
  }
  const output = await executor({...input, node: {...input.node, config}})
  input.context.signal.throwIfAborted()
  return {...output, metadata: {...output.metadata, durationMs: performance.now()-started, tokens: Math.min(Number(config.simulatedTokens), Number(config.maxTokens ?? Infinity)), cost: Number(config.simulatedCost)}}
 }
}
