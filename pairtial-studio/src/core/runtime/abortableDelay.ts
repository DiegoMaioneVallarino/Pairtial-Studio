
export function abortableDelay(
    ms: number,
    signal: AbortSignal
): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal.aborted) {
            reject(
                new DOMException(
                    "Execution cancelled",
                    "AbortError"
                )
            )
            return
        }

        const onAbort = () => {
            clearTimeout(timer)
            reject(
                new DOMException(
                    "Execution cancelled",
                    "AbortError"
                )
            )
        }

        const timer = setTimeout(() => {
            signal.removeEventListener(
                "abort",
                onAbort
            )
            resolve()
        }, ms)

        signal.addEventListener(
            "abort",
            onAbort,
            { once: true }
        )
    })
}
