import type { NodeProps } from "@xyflow/react"
import type { NodeExecutionState } from "../../../core/types/types"
import AgentShell from "../AgentShell/AgentShell"

export default function DatabaseNode({ data }: NodeProps) {
    return <AgentShell kind="db" name={String(data.name ?? "Database")}
        description={String(data.description ?? "")} color="blue"
        executionState={data.executionState as NodeExecutionState | undefined}
        icon={<svg viewBox="0 0 24 24" fill="none"><path d="M4 6 C4 2 20 2 20 6 V18 C20 22 4 22 4 18 Z M4 6 C4 10 20 10 20 6 M4 12 C4 16 20 16 20 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>} />
}
