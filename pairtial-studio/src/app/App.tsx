import "./App.css"

import {
    useState
} from "react"

import TopBar from "../components/layout/TopBar/TopBar"

import Workspace from "../features/workspace/Workspace"

import LeftBar, {
    type LeftBarButtonsTypes
} from "../components/layout/LeftBar/LeftBar"



function App() {
const [
    isRunning,
    setIsRunning
] = useState(false)


const [
    executionRequest,
    setExecutionRequest
] = useState(0)

function handleExecute() {

    if (isRunning) {
        return
    }

    setExecutionRequest(
        current => current + 1
    )
}



   const [
    selectedButton,
    setSelectedButton
] = useState<LeftBarButtonsTypes | null>(
    null
)


    return (
        <div className="app">

            <TopBar
    projectName="My First Fabric"

    isRunning={isRunning}

    onExecute={handleExecute}
/>


            <div className="app-body">

                <LeftBar
                    selectedButton={selectedButton}
                    onSelectButton={setSelectedButton}
                />


                <Workspace
    selectedButton={selectedButton}

    executionRequest={executionRequest}

    onRunningChange={setIsRunning}
/>

            </div>

        </div>
    )
}


export default App