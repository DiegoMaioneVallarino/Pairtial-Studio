import "./Workspace.css"

import {
    useCallback,
    useEffect,
    useState,
    useRef
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
    useSystemStore
} from "../../stores/systemStore"

import {
    pairtialSystemToReactFlow
} from "../../core/graph/pairtialSystemToReactFlow"



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


function Workspace({
    selectedButton,
    executionRequest,
    onRunningChange
}: WorkspaceProps) {

    const [
        runtimeEvents,
        setRuntimeEvents
    ] = useState<RuntimeEvent[]>([])

    const systems =
    useSystemStore(
        state =>
            state.systems
    )


        const activeSystemId =
            useSystemStore(
                state =>
                    state.activeSystemId
            )


        const updateSystemGraph =
            useSystemStore(
                state =>
                    state.updateSystemGraph
            )


        const activeSystem =
            systems.find(
                system =>
                    system.id ===
                    activeSystemId
            ) ?? null


        const loadingSystemRef =
            useRef(false)


    const [
        selectedNodeId,
        setSelectedNodeId
    ] = useState<string | null>(null)


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

    loadingSystemRef.current =
        true


    if (!activeSystem) {

        setNodes([])
        setEdges([])
        setSelectedNodeId(null)

        queueMicrotask(() => {
            loadingSystemRef.current =
                false
        })

        return
    }


    const graph =
        pairtialSystemToReactFlow(
            activeSystem
        )


    setNodes(
        graph.nodes
    )

    setEdges(
        graph.edges
    )

    setSelectedNodeId(null)


    queueMicrotask(() => {
        loadingSystemRef.current =
            false
    })


}, [
    activeSystemId,
    setNodes,
    setEdges
])

useEffect(() => {

    if (
        loadingSystemRef.current
    ) {
        return
    }


    if (!activeSystemId) {
        return
    }


    const system =
        reactFlowToPairtialSystem(
            nodes,
            edges,
            "Temporary"
        )


    updateSystemGraph(
        activeSystemId,
        system.nodes,
        system.edges
    )


}, [
    nodes,
    edges,
    activeSystemId,
    updateSystemGraph
])

    const selectedNode =
        nodes.find(
            node =>
                node.id === selectedNodeId
        ) ?? null


    useEffect(() => {

        if (
            executionRequest === 0
        ) {
            return
        }


        async function execute() {

            onRunningChange(true)


            try {

                if (!activeSystem) {
    throw new Error(
        "No active system selected"
    )
}


const graph =
    reactFlowToPairtialSystem(
        nodes,
        edges,
        activeSystem.name
    )


const system = {
    ...graph,

    id:
        activeSystem.id,

    createdAt:
        activeSystem.createdAt,

    updatedAt:
        activeSystem.updatedAt
}


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
if (
    event.type ===
    "node.started"
) {

    setNodes(
        currentNodes =>
            currentNodes.map(
                node =>
                    node.id ===
                    event.nodeId
                        ? {
                            ...node,

                            data: {
                                ...node.data,

                                executionState:
                                    "running"
                            }
                        }
                        : node
            )
    )
}


if (
    event.type ===
    "node.completed"
) {

    setNodes(
        currentNodes =>
            currentNodes.map(
                node =>
                    node.id ===
                    event.nodeId
                        ? {
                            ...node,

                            data: {
                                ...node.data,

                                executionState:
                                    "success"
                            }
                        }
                        : node
            )
    )
}


if (
    event.type ===
    "node.failed"
) {

    setNodes(
        currentNodes =>
            currentNodes.map(
                node =>
                    node.id ===
                    event.nodeId
                        ? {
                            ...node,

                            data: {
                                ...node.data,

                                executionState:
                                    "error"
                            }
                        }
                        : node
            )
    )
}
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


    const handleNodeClick =
        useCallback(
            (
                _event: React.MouseEvent,
                node: Node
            ) => {

                setSelectedNodeId(
                    node.id
                )

            },
            []
        )


    const updateSelectedNodeData =
        useCallback(
            (
                data:
                    Record<string, unknown>
            ) => {

                if (!selectedNodeId) {
                    return
                }


                setNodes(
                    currentNodes =>
                        currentNodes.map(
                            node => {

                                if (
                                    node.id !==
                                    selectedNodeId
                                ) {
                                    return node
                                }


                                return {
                                    ...node,

                                    data: {
                                        ...node.data,
                                        ...data
                                    }
                                }

                            }
                        )
                )

            },
            [
                selectedNodeId,
                setNodes
            ]
        )


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

                    setSelectedNodeId(null)

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


                setSelectedNodeId(
                    newNode.id
                )

            },

            [
                selectedButton,
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

                            onNodeClick={
                                handleNodeClick
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
                    selectedPanel="properties"
                    selectedNode={
                        selectedNode
                    }
                    onUpdateNode={
                        updateSelectedNodeData
                    }
                />

            </div>


            <BottomBar
                events={
                    runtimeEvents
                }
            />

        </div>
    )
}


export default Workspace