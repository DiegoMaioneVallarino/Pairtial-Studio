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

const [maxConcurrency, setMaxConcurrency] = useState(4)
const [stopRequest, setStopRequest] = useState(0)
const [resetRequest, setResetRequest] = useState(0)

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

    maxConcurrency={maxConcurrency}
    onConcurrencyChange={setMaxConcurrency}
    onExecute={handleExecute}
    onStop={() => setStopRequest(n => n + 1)}
    onReset={() => setResetRequest(n => n + 1)}
/>


            <div className="app-body">

                <LeftBar
                    selectedButton={selectedButton}
                    onSelectButton={setSelectedButton}
                />


                <Workspace
    selectedButton={selectedButton}

    maxConcurrency={maxConcurrency}
    executionRequest={executionRequest}
    stopRequest={stopRequest}
    resetRequest={resetRequest}

    onRunningChange={setIsRunning}
/>

            </div>

        </div>
    )
}


export default App