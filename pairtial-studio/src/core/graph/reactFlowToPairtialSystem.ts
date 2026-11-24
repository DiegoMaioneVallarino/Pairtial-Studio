import type {
    Edge,
    Node
} from "@xyflow/react"

import type {
    FeedbackConfig,
    NodeKind,
    PairtialEdge,
    PairtialNode,
    PairtialSystem
} from "../types/types"


type ReactFlowNodeData = {
    name?: string
    description?: string

    [key: string]: unknown
}


export function reactFlowToPairtialSystem(
    nodes: Node[],
    edges: Edge[],
    systemName = "Untitled System"
): PairtialSystem {

    const pairtialNodes: PairtialNode[] =
        nodes.map(node => {

            if (!node.type) {
                throw new Error(
                    `Node "${node.id}" has no type`
                )
            }


            const data =
                node.data as ReactFlowNodeData


            return {
                id:
                    node.id,

                kind:
                    node.type as NodeKind,

                name:
                    data.name ??
                    node.type,

                position: {
                    x: node.position.x,
                    y: node.position.y
                },

                config: {
                    ...Object.fromEntries(Object.entries(data).filter(([key]) => key !== "executionState"))
                }
            }
        })


    const pairtialEdges: PairtialEdge[] =
        edges.map(edge => ({
            id:
                edge.id,

            sourceNodeId:
                edge.source,

            targetNodeId:
                edge.target,

            sourcePortId:
                edge.sourceHandle ??
                undefined,

            targetPortId:
                edge.targetHandle ??
                undefined,

            feedback:
                (edge.data as { feedback?: FeedbackConfig } | undefined)?.feedback
        }))


    return {
        id:
            crypto.randomUUID(),

        name:
            systemName,

        createdAt: Date.now(),
        updatedAt: Date.now(),
        nodes:
            pairtialNodes,

        edges:
            pairtialEdges
    }
}