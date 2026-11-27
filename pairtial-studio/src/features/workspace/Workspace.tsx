import { runRemote, listRemoteRuns, listRemoteDecisions, remoteDecisions, serverRequest } from "../../core/remote/serverClient"
import { RunJournal, type Checkpoint } from "../../core/storage/runJournal"
import { ArtifactRegistry, type Artifact } from "../../core/artifacts/artifactRegistry"
import { DecisionManager, type DecisionRequest } from "../../core/decisions/decisionManager"
import DecisionInbox from "./DecisionInbox"
import { HumanNode, FabricNode, LoopNode, DeferredNode, BestOfTwoNode } from "../nodes/IterationNodes"
import { connectionError } from "../../core/ports/portRegistry"
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



import type {
    RuntimeEvent
} from "../../core/runtime/runtime.types"


import {
    useSystemStore
} from "../../stores/systemStore"

import {
    pairtialSystemToReactFlow
} from "../../core/graph/pairtialSystemToReactFlow"

import ExecutionEdge from "../edges/ExecutionEdge/ExecutionEdge"


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
import DatabaseNode from "../nodes/DatabaseNode/DatabaseNode"
import KingNode from "../nodes/KingNode/KingNode"
import HRNode from "../nodes/HRNode/HRNode"

import type {
    LeftBarButtonsTypes
} from "../../components/layout/LeftBar/LeftBar"


type WorkspaceProps = {
    selectedButton:
        LeftBarButtonsTypes | null

    maxConcurrency: number
    executionRequest: number
    stopRequest: number
    resetRequest: number

    onRunningChange: (
        running: boolean
    ) => void
}


const nodeTypes = {
    human: HumanNode, fabric: FabricNode, loop: LoopNode, deferred: DeferredNode, "best-of-two": BestOfTwoNode,
    db: DatabaseNode,
    king: KingNode,

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

const edgeTypes = {

    execution:
        ExecutionEdge

}

const nodeDefaults = {
    human: {name:"Human",description:"Decisión humana"},
    fabric: {name:"Fabric", description:"Sistema reutilizable", fabricId:""},
    loop: {name:"Loop", description:"Iteración simulada"},
    deferred: {name:"Deferred", description:"Espera configurable"},
    "best-of-two": {name:"Best of Two", description:"Comparación simulada"},
    db: { name: "Database", description: "Memoria simulada", operation: "write", key: "result", value: "" },
    king: { name: "King", description: "Orquestación simulada", objective: "Evaluar resultados", decision: "approve" },

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
    maxConcurrency,
    executionRequest,
    stopRequest,
    resetRequest,
    onRunningChange
}: WorkspaceProps) {

    const [journal] = useState(() => new RunJournal(localStorage))
    const [serverOnline,setServerOnline]=useState(false)
    const [activeRemote,setActiveRemote]=useState<string[]>([])
    const [storageError,setStorageError] = useState("")
    const [history,setHistory] = useState<Checkpoint[]>(() => {try{return journal.list()}catch{return []}})
    const [resumeRequest,setResumeRequest] = useState<Checkpoint|null>(null)
    const [artifactRecords,setArtifactRecords] = useState<Artifact[]>(() => {const map=new Map<string,Artifact>(); for(const run of [...history].reverse()) for(const a of run.artifacts) map.set(`${a.id}:${a.version}`,a);return [...map.values()]})
    const [artifactRegistry] = useState(() => new ArtifactRegistry(setArtifactRecords,artifactRecords))
    const [requests,setRequests] = useState<DecisionRequest[]>([])
    const [decisions] = useState(() => new DecisionManager(setRequests))
    const [remoteRequests,setRemoteRequests]=useState<DecisionRequest[]>([])
    useEffect(()=>{let alive=true;let busy=false;const poll=async()=>{if(busy)return;busy=true;try{const [runs,requests,status]=await Promise.all([listRemoteRuns(),listRemoteDecisions(),serverRequest<{active:string[]}>("/status")]);if(alive){setServerOnline(true);setActiveRemote(status.active);setHistory(runs);setRemoteRequests(requests);for(const r of runs)artifactRegistry.restore(r.artifacts);if(!controllerRef.current)onRunningChange(status.active.length>0)}}catch{if(alive)setServerOnline(false)}finally{busy=false}};void poll();const timer=setInterval(poll,1000);return()=>{alive=false;clearInterval(timer)}},[artifactRegistry])
    const controllerRef = useRef<AbortController | null>(null)
    const lastRequest = useRef(0)
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

    setRuntimeEvents(history.find(r=>r.system.id===activeSystemId)?.events ?? [])
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

    useEffect(() => {
        if (stopRequest) {if(controllerRef.current)controllerRef.current.abort();else void serverRequest<{active:string[]}>("/status").then(s=>Promise.all(s.active.map(id=>serverRequest(`/runs/${id}/cancel`,{})))).catch(console.error)}
    }, [stopRequest])

    useEffect(() => {
        if (!resetRequest || controllerRef.current) return
        setRuntimeEvents([])
        setNodes(items => items.map(n => ({ ...n, data: { ...n.data, executionState: "idle" } })))
        setEdges(items => items.map(e => ({ ...e, data: { ...e.data, active: false, pulse: undefined, routeState: undefined } })))
    }, [resetRequest, setNodes, setEdges])

    const selectedNode =
        nodes.find(
            node =>
                node.id === selectedNodeId
        ) ?? null


    useEffect(() => {

        if (
            (!resumeRequest && (executionRequest === 0 || executionRequest === lastRequest.current)) || controllerRef.current !== null
        ) {
            return
        }


        lastRequest.current = executionRequest
        const restoring = resumeRequest
        setResumeRequest(null)
        async function execute() {
            const controller = new AbortController()
            controllerRef.current = controller
            setEdges(items => items.map(e => ({...e, data: {...e.data, routeState: undefined, active: false, pulse: undefined}})))
            setNodes(items => items.map(n => ({ ...n, data: { ...n.data, executionState: "waiting" } })))

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


                setRuntimeEvents(restoring?.events ?? [])
                if(restoring) setNodes(items=>items.map(n=>({...n,data:{...n.data,executionState:restoring.nodeStates[n.id]??"idle"}})))

                const result =
                    await runRemote(
                        system,
                        {
                            checkpoint: restoring ?? undefined,
                            onCheckpoint: cp => {
                                try {setHistory(old=>[cp,...old.filter(r=>r.runId!==cp.runId)]);setStorageError("")}
                                catch(error){setStorageError(`No se pudo guardar: ${String(error)}`);controller.abort()}
                            },
                            signal: controller.signal,
                            maxConcurrency,
                            decisions,
                            artifacts: artifactRegistry,
                            fabrics: useSystemStore.getState().systems,
                            onEvent: event => {
                                if (useSystemStore.getState().activeSystemId !== system.id) return

                                setRuntimeEvents(
                                    current => [
                                        ...current,
                                        event
                                    ]
                                )

                                if (event.type === "decision.requested" || event.type === "decision.responded") {
                                    setNodes(items => items.map(n => n.id === event.nodeId ? {...n,data:{...n.data,executionState:event.type === "decision.requested" ? "awaiting-human" : "running"}} : n))
                                }
                                if (event.type === "edge.routed") {
                                    setEdges(items => items.map(edge => edge.id === event.edgeId ? {
                                        ...edge, data: {...edge.data, routeState: event.active ? "taken" : "skipped", active: event.active, pulse: event.active ? Date.now() : undefined}
                                    } : edge))
                                }
                                if (event.type === "node.skipped") {
                                    setNodes(items => items.map(node => node.id === event.nodeId ? {...node, data: {...node.data, executionState: "skipped"}} : node))
                                }

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


                if (useSystemStore.getState().activeSystemId === system.id) {
                    setNodes(items => items.map(n => ({ ...n, data: { ...n.data, executionState: result.nodeStates[n.id] ?? "idle" } })))
                    setEdges(items => items.map(e => ({ ...e, data: { ...e.data, active: false, pulse: undefined } })))
                }
                console.log(
                    "PAIRtial Runtime Result:",
                    result
                )

            } catch (error) {

                setStorageError(String(error))
                console.error(
                    "PAIRtial execution failed:",
                    error
                )

            } finally {

                controllerRef.current = null
                onRunningChange(false)

            }
        }


        execute()


    }, [
        executionRequest, resumeRequest
    ])


    const isValidConnection = useCallback((connection: Connection | Edge) => {
        const source = nodes.find(n => n.id === connection.source)
        const target = nodes.find(n => n.id === connection.target)
        return !!source && !!target && source.id !== target.id && !connectionError(source.type ?? "", target.type ?? "", connection.sourceHandle, connection.targetHandle)
    }, [nodes])

    const onConnect =
        useCallback(

            (
                connection:
                    Connection
            ) => {

                if (!isValidConnection(connection)) return
                setEdges(
                    currentEdges =>
                        addEdge(
                            {
                                ...connection,

                                type:
                                   "execution"
                            },

                            currentEdges
                        )
                )

            },

            [
                setEdges, isValidConnection
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
                    selectedButton === null
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
                    selectedButton === "fabrics" ? "fabric" : selectedButton


                const defaults =
                    nodeDefaults[nodeType]


                const newNode: Node = {

                    id:
                        crypto.randomUUID(),

                    type:
                        nodeType,

                    position,

                    data: {

                        ...defaults

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
            <DecisionInbox requests={serverOnline?remoteRequests:requests} manager={serverOnline?remoteDecisions:decisions}/>
            <details style={{position:"absolute",top:12,left:12,zIndex:20,background:"#222",color:"white",padding:8,maxWidth:320}}>
                <summary>Core Server {serverOnline?"online":"offline"} · History ({history.length})</summary>
                {storageError && <p role="alert">{storageError}</p>}
                {history.filter(r=>r.system.id===activeSystemId).map(r=><div key={r.runId} style={{padding:6}}>
                    <small>{new Date(r.updatedAt).toLocaleString()} · {r.status === "running" && !activeRemote.includes(r.runId) ? "interrupted" : r.status}</small>
                    <button disabled={!!controllerRef.current} onClick={()=>{setRuntimeEvents(r.events);setNodes(items=>items.map(n=>({...n,data:{...n.data,executionState:r.nodeStates[n.id]??"idle"}})))}}>Inspect</button>
                    {r.status==="running" && !activeRemote.includes(r.runId) && <button disabled={!!controllerRef.current} onClick={()=>setResumeRequest(r)}>Resume</button>}
                </div>)}
            </details>

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

                            isValidConnection={isValidConnection}
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
                                edgeTypes={
                                    edgeTypes
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
    artifacts={artifactRecords}
    selectedPanel="properties"
    selectedNode={
        selectedNode
    }
    runtimeEvents={
        runtimeEvents
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