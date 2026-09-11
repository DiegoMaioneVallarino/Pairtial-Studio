import "./TopBar.css"

  type TopBarProps = {
    projectName: string
    isRunning: boolean
  }


  export function TopBar({
    projectName,
    isRunning
}:TopBarProps){
    
    return (
        <header className="top-bar">

            <div>
                Pairtial Studio
            </div>

            <div>
                {projectName}
            </div>

            <div>
                {isRunning ? "Running..." : "Stopped"}
            </div>

        </header>
    )

}

export default TopBar

