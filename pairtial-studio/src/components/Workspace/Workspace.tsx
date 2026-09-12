import "./Workspace.css"

import BottomBar from "../BottomBar/BottomBar"
import  RightPanel  from "../RightPanel/RightPanel"

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
        <div id="WorkspaceArea">

           <div id="Workspace">
                <div id="WorkspaceInArea">
                     <div id="WorkspaceInAreaIn">
                    Current action: {action}
                </div>
                </div>
            
             <RightPanel selectedPanel={'fabrics'}/>
        </div>
        <BottomBar />
        </div>

       
    
</>
}
export default Workspace

