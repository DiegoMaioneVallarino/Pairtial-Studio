import "./Workspace.css"

import BottomBar from "../../components/layout/BottomBar/BottomBar"
import  RightPanel  from "../../components/layout/RightPanel/RightPanel"


type WorkspaceProps = {
}
function Workspace({
    
} ) {

    return <>
        <div id="WorkspaceArea">

           <div id="Workspace">
                <div id="WorkspaceInArea">
                     <div id="WorkspaceInAreaIn">
                </div>
                </div>
            
             <RightPanel selectedPanel={'fabrics'}/>
        </div>
        <BottomBar />
        </div>

       
    
</>
}
export default Workspace

