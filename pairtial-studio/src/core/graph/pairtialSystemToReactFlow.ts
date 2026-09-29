import type {
    Edge,
    Node
} from "@xyflow/react"

import type {
    PairtialSystem
} from "../types/types"


type ReactFlowGraph = {
    nodes: Node[]
    edges: Edge[]
}


export function pairtialSystemToReactFlow(
    system: PairtialSystem
): ReactFlowGraph {

    const nodes: Node[] =
        system.nodes.map(
            node => ({

                id:
                    node.id,

                type:
                    node.kind,

                position: {
                    x: node.position.x,
                    y: node.position.y
                },

                data: {
                    name:
                        node.name,

                    ...node.config
                }

            })
        )


    const edges: Edge[] =
        system.edges.map(
            edge => ({

                id:
                    edge.id,

                source:
                    edge.sourceNodeId,

                target:
                    edge.targetNodeId,

                sourceHandle:
                    edge.sourcePortId,

                targetHandle:
                    edge.targetPortId,

                type:
                    "smoothstep"

            })
        )


    return {
        nodes,
        edges
    }
}