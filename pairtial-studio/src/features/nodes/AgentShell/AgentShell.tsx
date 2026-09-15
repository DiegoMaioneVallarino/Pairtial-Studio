import "./AgentShell.css"

import type {
    ReactNode
} from "react"

import {
    Handle,
    Position
} from "@xyflow/react"


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
}


export default function AgentShell({

    name,
    description,
    color,
    icon

}: AgentShellProps) {

    return (

        <div
            className={
                `agent-shell agent-${color}`
            }
        >

            {/* INPUT */}

            <Handle
                type="target"
                position={Position.Left}
                className="agent-connection agent-input"
            />


            {/* ROBOT */}

            <div className="agent-robot">


                {/* CABEZA - RECTÁNGULO TRASERO */}

                <div className="agent-head-back" />


                {/* CABEZA - RECTÁNGULO FRONTAL */}

                <div className="agent-head-front" />


                {/* CUERPO - RECTÁNGULO TRASERO */}

                <div className="agent-body-back" />


                {/* CUERPO - RECTÁNGULO FRONTAL */}

                <div className="agent-body-front">

                    <div className="agent-icon-container">

                        {icon}

                    </div>

                </div>


            </div>


            {/* INFORMACIÓN */}

            <div className="agent-info">

                <div className="agent-title">
                    {name}
                </div>

                <div className="agent-description">
                    {description}
                </div>

            </div>


            {/* OUTPUT */}

            <Handle
                type="source"
                position={Position.Right}
                className="agent-connection agent-output"
            />

        </div>

    )
}