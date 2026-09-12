import "./App.css"

import  TopBar  from "./components/TopBar/TopBar"
import  LeftBar  from "./components/LeftBar/LeftBar"
import  Workspace  from "./components/Workspace/Workspace"

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

                

                
            </div>

            

        </div></>
    )

}

export default App