import type {
    NodeProps
} from "@xyflow/react"

import AgentShell from "../AgentShell/AgentShell"


export default function EngineerNode({
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
            color="purple"

            icon={
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                >

                    <circle
                        cx="12"
                        cy="8"
                        r="4"
                        fill="currentColor"
                    />

                    <path
                        d="
                            M5 20
                            C5 15.5 8 13 12 13
                            C16 13 19 15.5 19 20
                        "
                        fill="currentColor"
                    />

                </svg>
            }
        />
    )
}