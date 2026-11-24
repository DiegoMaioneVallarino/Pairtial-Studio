import type { NodeExecutionState } from "../../../core/types/types"
import type {
    NodeProps
} from "@xyflow/react"

import AgentShell from "../AgentShell/AgentShell"


export default function QualityNode({
    data
}: NodeProps) {

    const node =
        data as {
            name: string
            description: string
        }


    return (
        <AgentShell kind="quality" executionState={data.executionState as NodeExecutionState | undefined}
            name={node.name}
            description={node.description}
            color="red"

            icon={
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                >

                    <circle
                        cx="10"
                        cy="10"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="2"
                    />

                    <path
                        d="M14.5 14.5L20 20"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />

                </svg>
            }
        />
    )
}