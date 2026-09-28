import type {
    PairtialNode,
    PairtialSystem
} from "../types/types"


export function createExecutionPlan(
    system: PairtialSystem
): PairtialNode[] {

    const incomingCount =
        new Map<string, number>()


    const outgoing =
        new Map<string, string[]>()


    for (const node of system.nodes) {

        incomingCount.set(
            node.id,
            0
        )

        outgoing.set(
            node.id,
            []
        )
    }


    for (const edge of system.edges) {

        incomingCount.set(
            edge.targetNodeId,

            (
                incomingCount.get(
                    edge.targetNodeId
                ) ?? 0
            ) + 1
        )


        outgoing
            .get(edge.sourceNodeId)
            ?.push(
                edge.targetNodeId
            )
    }


    const queue =
        system.nodes
            .filter(
                node =>
                    incomingCount.get(
                        node.id
                    ) === 0
            )
            .map(
                node => node.id
            )


    const result: PairtialNode[] =
        []


    while (
        queue.length > 0
    ) {

        const nodeId =
            queue.shift()


        if (!nodeId) {
            continue
        }


        const node =
            system.nodes.find(
                currentNode =>
                    currentNode.id ===
                    nodeId
            )


        if (!node) {
            continue
        }


        result.push(
            node
        )


        const targets =
            outgoing.get(
                nodeId
            ) ?? []


        for (
            const targetId
            of targets
        ) {

            const nextCount =
                (
                    incomingCount.get(
                        targetId
                    ) ?? 0
                ) - 1


            incomingCount.set(
                targetId,
                nextCount
            )


            if (
                nextCount === 0
            ) {

                queue.push(
                    targetId
                )
            }
        }
    }


    if (
        result.length !==
        system.nodes.length
    ) {

        throw new Error(
            "System contains a cycle or an invalid dependency graph"
        )
    }


    return result
}