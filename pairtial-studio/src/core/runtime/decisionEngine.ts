import type { Envelope } from "../envelope/envelope.types"
import type { NodeKind } from "../types/types"

// Main output remains unconditional for existing graphs.
export function conditionalPort(kind: NodeKind, output: Envelope): string | undefined {
    const payload = output.payload
    if (!payload || typeof payload !== "object") return
    if (kind === "loop" && "reached" in payload) return payload.reached === true ? "reached" : "exhausted"
    if (kind === "best-of-two" && "winner" in payload) return payload.winner === "a" ? "a" : "b"
    if (kind === "quality" && "passed" in payload) {
        if (payload.passed === true) return "passed"
        if (payload.passed === false) return "rejected"
    }
    if ((kind === "human" || kind === "king" || kind === "supervisor") && "decision" in payload) {
        switch (payload.decision) {
            case "approve": case "approved": return "approved"
            case "revise": return "revise"
            case "reject": case "rejected": return "rejected"
        }
    }
}
