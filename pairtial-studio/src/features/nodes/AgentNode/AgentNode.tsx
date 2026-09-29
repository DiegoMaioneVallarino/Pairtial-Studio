import type {
    NodeProps
} from "@xyflow/react"

import AgentShell from "../AgentShell/AgentShell"

import type {
    NodeExecutionState
} from "../../../core/types/types"


type AgentNodeData = {

    name: string

    description: string

    executionState?:
        NodeExecutionState
}


function AgentNode({

    data

}: NodeProps) {

    const agent =
        data as AgentNodeData


    return (

        <AgentShell

            name={
                agent.name
            }

            description={
                agent.description
            }

            executionState={
                agent.executionState
            }

            color="yellow"

            icon={

                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                >

                    <rect
                        x="3"
                        y="5"
                        width="18"
                        height="13"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="2"
                    />

                    <path
                        d="M8 21H16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />

                    <path
                        d="M12 18V21"
                        stroke="currentColor"
                        strokeWidth="2"
                    />

                </svg>

            }

        />

    )
}


export default AgentNode