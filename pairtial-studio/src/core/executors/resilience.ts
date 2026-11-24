import { getConfig } from "../config/nodeConfig"
import { abortableDelay } from "../runtime/abortableDelay"
import type { ExecutorInput, NodeExecutor } from "./executor.types"

export class TimeoutError extends Error {
    constructor(ms: number) {
        super(`Timeout tras ${ms} ms`)
        this.name = "TimeoutError"
    }
}

function isAbort(error: unknown): boolean {
    return error instanceof Error && error.name === "AbortError"
}

function isRetryable(error: unknown): boolean {
    return !(typeof error === "object" && error !== null && "retryable" in error && error.retryable === false)
}

/** Un intento con su propio AbortSignal y timeout opcional. */
async function attempt(executor: NodeExecutor, input: ExecutorInput, timeoutMs: number) {
    const parent = input.context.signal
    const controller = new AbortController()
    const onParentAbort = () => controller.abort(parent.reason)
    parent.addEventListener("abort", onParentAbort, { once: true })
    if (parent.aborted) onParentAbort()

    let timer: ReturnType<typeof setTimeout> | undefined
    try {
        const run = executor({ ...input, context: { ...input.context, signal: controller.signal } })
        if (timeoutMs <= 0) return await run
        run.catch(() => {}) // si pierde la carrera, no dejar un rechazo sin manejar
        const timeout = new Promise<never>((_, reject) => {
            timer = setTimeout(() => {
                controller.abort()
                reject(new TimeoutError(timeoutMs))
            }, timeoutMs)
        })
        return await Promise.race([run, timeout])
    } finally {
        clearTimeout(timer)
        parent.removeEventListener("abort", onParentAbort)
    }
}

/**
 * Reintentos con backoff exponencial y timeout por intento, leídos de la
 * configuración del nodo (`retries`, `retryDelayMs`, `timeoutMs`).
 * Nunca reintenta cancelaciones ni errores marcados `retryable: false`.
 */
export function withResilience(executor: NodeExecutor): NodeExecutor {
    return async input => {
        const config = getConfig(input.node.kind, input.node.config)
        const maxAttempts = Number(config.retries) + 1
        const baseDelay = Number(config.retryDelayMs)
        const timeoutMs = Number(config.timeoutMs)

        for (let attemptNumber = 1; ; attemptNumber++) {
            try {
                return await attempt(executor, input, timeoutMs)
            } catch (error) {
                if (input.context.signal.aborted || (isAbort(error) && !(error instanceof TimeoutError))) throw error
                if (attemptNumber >= maxAttempts || !isRetryable(error)) throw error

                const delayMs = baseDelay * 2 ** (attemptNumber - 1)
                input.context.emit({
                    type: "node.retrying",
                    runId: input.context.runId,
                    nodeId: input.node.id,
                    timestamp: Date.now(),
                    attempt: attemptNumber,
                    maxAttempts,
                    error: error instanceof Error ? error.message : String(error),
                    delayMs
                })
                await abortableDelay(delayMs, input.context.signal)
            }
        }
    }
}
