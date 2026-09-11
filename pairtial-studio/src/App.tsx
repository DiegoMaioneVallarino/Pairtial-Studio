import "./App.css"

import  TopBar  from "./components/TopBar/TopBar"
import  LeftBar  from "./components/LeftBar/LeftBar"
import  Workspace  from "./components/Workspace/Workspace"
import  RightPanel  from "./components/RightPanel/RightPanel"

function App() {

    return (<>
        <div className="app">

            <TopBar
                projectName="My First Fabric"
                isRunning={false}
            />

            <div className="app-body">

                <LeftBar selectedButton={'selection'}/>

                <Workspace action={'selection'} />

                <RightPanel selectedPanel={'fabrics'}/>

                
            </div>

            

        </div></>
    )

}

export default App