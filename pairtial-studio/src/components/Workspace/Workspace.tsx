import "./Workspace.css"

import BottomBar from "../BottomBar/BottomBar"

type WorkspaceAction =
    | "selection"
    | "agent"
    | "api"
    | "fabrics"
    
type WorkspaceProps = {
    action:WorkspaceAction
}
function Workspace({
    action
}: WorkspaceProps) {

    return <>
        <div id="Workspace">

            Current action: {action}
             <BottomBar />
        </div>

       
    
</>
}
export default Workspace

