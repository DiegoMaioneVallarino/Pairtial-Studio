import type {
    NodeProps
} from "@xyflow/react"

import AgentShell from "../AgentShell/AgentShell"


export default function HRNode({
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
            color="pink"

            icon={
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                >

                    <circle
                        cx="9"
                        cy="8"
                        r="3"
                        fill="currentColor"
                    />

                    <circle
                        cx="16"
                        cy="9"
                        r="2.5"
                        fill="currentColor"
                    />

                    <path
                        d="
                            M3 19
                            C3 15 5.5 13 9 13
                            C12.5 13 15 15 15 19
                        "
                        fill="currentColor"
                    />

                    <path
                        d="
                            M14 14
                            C18 13 21 15 21 19
                            H16
                        "
                        fill="currentColor"
                    />

                </svg>
            }
        />
    )
}