import type {
    NodeProps
} from "@xyflow/react"

import AgentShell from "../AgentShell/AgentShell"


export default function SupervisorNode({
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
            color="blue"

            icon={
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                >

                    <path
                        d="
                            M2 12
                            C5 7 8 5 12 5
                            C16 5 19 7 22 12
                            C19 17 16 19 12 19
                            C8 19 5 17 2 12Z
                        "
                        stroke="currentColor"
                        strokeWidth="2"
                    />

                    <circle
                        cx="12"
                        cy="12"
                        r="3"
                        fill="currentColor"
                    />

                </svg>
            }
        />
    )
}