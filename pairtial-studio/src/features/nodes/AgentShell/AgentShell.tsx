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

    name: string

    description: string

    color: AgentColor

    icon: ReactNode

    executionState?:
        NodeExecutionState
}


export default function AgentShell({

    name,
    description,
    color,
    icon,
    executionState = "idle"

}: AgentShellProps) {

    return (

        <div
            className={
                `agent-shell agent-${color} execution-${executionState}`
            }
        >

            <Handle
                type="target"
                position={Position.Left}
                className="agent-connection agent-input"
            />


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


            <Handle
                type="source"
                position={Position.Right}
                className="agent-connection agent-output"
            />

        </div>

    )
}