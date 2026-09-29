import "./ExecutionEdge.css"

import {
    BaseEdge,
    getSmoothStepPath,
    type EdgeProps
} from "@xyflow/react"


type ExecutionEdgeData = {
    pulse?: number
    active?: boolean

}


export default function ExecutionEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    style,
    data
}: EdgeProps) {

    const [
        edgePath
    ] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition
    })


    const edgeData =
        data as ExecutionEdgeData | undefined


    return (
        <>

           <BaseEdge
    id={id}
    path={edgePath}
    markerEnd={markerEnd}
    style={style}
    className={
    edgeData?.active
        ? "execution-edge-path execution-edge-active"
        : "execution-edge-path"
}
/>


            {edgeData?.pulse !== undefined && (

                <circle
                    key={edgeData.pulse}
                    r="4"
                    className="execution-edge-particle"
                >

                    <animateMotion
                        dur="550ms"
                        path={edgePath}
                        fill="freeze"
                    />

                </circle>

            )}

        </>
    )
}