import "./Workspace.css"

import {
    useCallback,
    useEffect,
    useState
} from "react"

import {
    reactFlowToPairtialSystem
} from "../../core/graph/reactFlowToPairtialSystem"

import {
    runSystem
} from "../../core/runtime/runSystem"

import type {
    RuntimeEvent
} from "../../core/runtime/runtime.types"


import {
    ReactFlow,
    Background,
    addEdge,
    useNodesState,
    useEdgesState,
    type Connection,
    type Node,
    type Edge
} from "@xyflow/react"

import "@xyflow/react/dist/style.css"


import BottomBar from "../../components/layout/BottomBar/BottomBar"

import RightPanel from "../../components/layout/RightPanel/RightPanel"

import AgentNode from "../nodes/AgentNode/AgentNode"

import ApiNode from "../nodes/ApiNode/ApiNode"

import QualityNode from "../nodes/QualityNode/QualityNode"

import EngineerNode from "../nodes/EngineerNode/EngineerNode"

import SupervisorNode from "../nodes/SupervisorNode/SupervisorNode"

import HRNode from "../nodes/HRNode/HRNode"
import type {
    LeftBarButtonsTypes
} from "../../components/layout/LeftBar/LeftBar"


type WorkspaceProps = {
    selectedButton:
        LeftBarButtonsTypes | null

    executionRequest: number

    onRunningChange: (
        running: boolean
    ) => void
}
type BottomBarProps = {
    events: RuntimeEvent[]
}
const nodeTypes = {

    agent:
        AgentNode,

    api:
        ApiNode,

    quality:
        QualityNode,

    engineer:
        EngineerNode,

    supervisor:
        SupervisorNode,

    hr:
        HRNode

}


function Workspace({
    selectedButton,
    executionRequest,
    onRunningChange
}: WorkspaceProps) {

const [
    runtimeEvents,
    setRuntimeEvents
] = useState<RuntimeEvent[]>([])


    const [
        nodes,
        setNodes,
        onNodesChange
    ] = useNodesState<Node>([])


    const [
        edges,
        setEdges,
        onEdgesChange
    ] = useEdgesState<Edge>([])
useEffect(() => {

    if (
        executionRequest === 0
    ) {
        return
    }


    async function execute() {

        onRunningChange(true)


        try {

            const system =
                reactFlowToPairtialSystem(
                    nodes,
                    edges,
                    "My First Fabric"
                )


            console.log(
                "PAIRtial System:",
                system
            )


            setRuntimeEvents([])


const result =
    await runSystem(
        system,
        {
            onEvent: event => {

                setRuntimeEvents(
                    current => [
                        ...current,
                        event
                    ]
                )

            }
        }
    )


            console.log(
                "PAIRtial Runtime Result:",
                result
            )

        } catch (error) {

            console.error(
                "PAIRtial execution failed:",
                error
            )

        } finally {

            onRunningChange(false)

        }
    }


    execute()


}, [
    executionRequest
])

    const onConnect =
        useCallback(

            (
                connection:
                    Connection
            ) => {

                setEdges(
                    currentEdges =>
                        addEdge(
                            {
                                ...connection,

                                type:
                                    "smoothstep"
                            },

                            currentEdges
                        )
                )

            },

            [
                setEdges
            ]
        )
const nodeDefaults = {

    agent: {
        name: "Agente",
        description: "Modelo de IA"
    },

    api: {
        name: "Agente API",
        description: "Datos de internet"
    },

    quality: {
        name: "Revisor QA",
        description: "Valida resultado"
    },

    engineer: {
        name: "Engineer",
        description: "Genera y optimiza"
    },

    supervisor: {
        name: "Supervisor",
        description: "Monitorea todo"
    },

    hr: {
        name: "RRHH",
        description: "Busca mejores Fabrics"
    }

}

    const handlePaneClick =
        useCallback(

            (
                event:
                    React.MouseEvent
            ) => {

               if (
    selectedButton === null ||
    selectedButton === "fabrics"
) {
    return
}


                const target =
                    event.currentTarget


                const bounds =
                    target
                        .getBoundingClientRect()


                const position = {

                    x:
                        event.clientX -
                        bounds.left -
                        50,

                    y:
                        event.clientY -
                        bounds.top -
                        50

                }


                const nodeType =
    selectedButton


const defaults =
    nodeDefaults[nodeType]


const newNode: Node = {

    id:
        crypto.randomUUID(),

    type:
        nodeType,

    position,

    data: {

        name:
            defaults.name,

        description:
            defaults.description

    }

}


                setNodes(
                    currentNodes => [

                        ...currentNodes,

                        newNode

                    ]
                )

            },

            [
                selectedButton,
                nodes.length,
                setNodes
            ]
        )


    return (
        <div id="WorkspaceArea">

            <div id="Workspace">

                <div id="WorkspaceInArea">

                    <div id="WorkspaceInAreaIn">

                        <ReactFlow

                            nodes={
                                nodes
                            }

                            edges={
                                edges
                            }

                            nodeTypes={
                                nodeTypes
                            }

                            onNodesChange={
                                onNodesChange
                            }

                            onEdgesChange={
                                onEdgesChange
                            }

                            onConnect={
                                onConnect
                            }

                            onPaneClick={
                                handlePaneClick
                            }

                            deleteKeyCode={
                                "Delete"
                            }

                        >

                            <Background
                                gap={24}
                                size={1}
                            />

                        </ReactFlow>

                    </div>

                </div>


                <RightPanel
                    selectedPanel="fabrics"
                />

            </div>


            <BottomBar
    events={runtimeEvents}
/>

        </div>
    )
}


export default Workspace