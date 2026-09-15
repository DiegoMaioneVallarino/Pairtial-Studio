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
    selectedButton,
    setSelectedButton
] = useState<LeftBarButtonsTypes | null>(
    null
)


    return (
        <div className="app">

            <TopBar
                projectName="My First Fabric"
                isRunning={false}
            />


            <div className="app-body">

                <LeftBar
                    selectedButton={selectedButton}
                    onSelectButton={setSelectedButton}
                />


                <Workspace
                    selectedButton={selectedButton}
                />

            </div>

        </div>
    )
}


export default App