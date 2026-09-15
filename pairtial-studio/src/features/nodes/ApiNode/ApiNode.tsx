import type {
    NodeProps
} from "@xyflow/react"

import AgentShell from "../AgentShell/AgentShell"


export default function ApiNode({
    data
}: NodeProps) {

    const node =
        data as {
            name: string
            description: string
        }


    return (
        <AgentShell
            name={node.name}
            description={node.description}
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
                        d="M7 9H17"
                        stroke="currentColor"
                        strokeWidth="2"
                    />

                    <path
                        d="M7 13H13"
                        stroke="currentColor"
                        strokeWidth="2"
                    />

                </svg>
            }
        />
    )
}