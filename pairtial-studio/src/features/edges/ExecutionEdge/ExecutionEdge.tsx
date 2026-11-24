import "./ExecutionEdge.css"

import {
    BaseEdge,
    getSmoothStepPath,
    type EdgeProps
} from "@xyflow/react"


type ExecutionEdgeData = {
    routeState?: "taken" | "skipped"
    pulse?: number
    active?: boolean
    feedback?: unknown

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
    (edgeData?.routeState === "skipped" ? "execution-edge-path execution-edge-skipped" : edgeData?.active
        ? "execution-edge-path execution-edge-active"
        : edgeData?.routeState === "taken" ? "execution-edge-path execution-edge-taken" : "execution-edge-path")
        + (edgeData?.feedback ? " execution-edge-feedback" : "")
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