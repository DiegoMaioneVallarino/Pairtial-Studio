import { getPorts } from "../../../core/ports/portRegistry"
import "./AgentShell.css"

import type {
    ReactNode
} from "react"

import {
    Handle,
    Position
} from "@xyflow/react"

import type {
    NodeExecutionState
} from "../../../core/types/types"


export type AgentColor =
    | "yellow"
    | "red"
    | "purple"
    | "blue"
    | "pink"


type AgentShellProps = {

    kind: string
    name: string

    description: string

    color: AgentColor

    icon: ReactNode

    executionState?:
        NodeExecutionState
}


export default function AgentShell({

    kind,
    name,
    description,
    color,
    icon,
    executionState = "idle"

}: AgentShellProps) {

    const ports = getPorts(kind)
    return (

        <div
            className={
                `agent-shell agent-${color} execution-${executionState}`
            }
        >

            {ports.inputs.map((port, index) => (
                <Handle key={port.id} id={port.id} type="target"
                    position={Position.Left}
                    title={`${port.label} (${port.type})`}
                    className="agent-connection agent-input typed-port"
                    style={{top: 74 + (index - (ports.inputs.length - 1)/2)*22}}
                />
            ))}


            <div className="agent-robot">

                <div className="agent-execution-glow" />


                <div className="agent-head-back" />


                <div className="agent-head-front" />


                <div className="agent-body-back" />


                <div className="agent-body-front">

                    <div className="agent-icon-container">

                        {icon}

                    </div>

                </div>


                <div className="agent-processing-indicator">

                    <span />

                    <span />

                    <span />

                </div>

            </div>


            <div className="agent-info">

                <div className="agent-title">
                    {name}
                </div>

                <div className="agent-description">
                    {description}
                </div>

            </div>


            {ports.outputs.map((port, index) => (
                <Handle key={port.id} id={port.id} type="source"
                    position={Position.Right}
                    title={`${port.label} (${port.type})`}
                    className="agent-connection agent-output typed-port"
                    style={{top: 74 + (index - (ports.outputs.length - 1)/2)*22}}
                />
            ))}

        </div>

    )
}