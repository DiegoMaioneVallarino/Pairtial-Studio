import type { NodeProps } from "@xyflow/react"
import type { NodeExecutionState } from "../../../core/types/types"
import AgentShell from "../AgentShell/AgentShell"

export default function KingNode({ data }: NodeProps) {
    return <AgentShell kind="king" name={String(data.name ?? "King")}
        description={String(data.description ?? "")} color="yellow"
        executionState={data.executionState as NodeExecutionState | undefined}
        icon={<svg viewBox="0 0 24 24" fill="none"><path d="M3 6 L8 12 L12 4 L16 12 L21 6 L19 19 H5 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>} />
}
