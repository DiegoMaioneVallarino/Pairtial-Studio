import "./App.css"

import  TopBar  from "../components/layout/TopBar/TopBar"
import  LeftBar  from "../components/layout/LeftBar/LeftBar"
import  Workspace  from "../features/workspace/Workspace"

function App() {

    return (<>
        <div className="app">

            <TopBar
                projectName="My First Fabric"
                isRunning={false}
            />

            <div className="app-body">

                <LeftBar selectedButton={'selection'}/>

                <Workspace  />

                

                
            </div>

            

        </div></>
    )

}

export default App