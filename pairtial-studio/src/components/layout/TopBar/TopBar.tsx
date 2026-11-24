
import "./TopBar.css"


type TopBarProps = {
    projectName: string
    isRunning: boolean
    maxConcurrency: number
    onConcurrencyChange: (value: number) => void

    onExecute: () => void
    onStop: () => void
    onReset: () => void
}


export function TopBar({
    projectName,
    isRunning,
    maxConcurrency,
    onConcurrencyChange,
    onExecute,
    onStop,
    onReset
}: TopBarProps) {

    return (
        <header className="top-bar">

            {/* BRAND */}

            <div className="top-bar-brand">

                <div className="top-bar-logo">
                    pairtial
                </div>

                <span className="top-bar-studio">
                    Studio
                </span>

            </div>


            {/* HISTORY */}

            <div className="top-bar-history">

                <button
                    className="top-icon-button"
                    title="Proyectos"
                >
                    ⌂
                </button>

                <button
                    className="top-icon-button"
                    title="Historial"
                >
                    ◷
                </button>

            </div>


            {/* PROJECT */}

            <div className="top-bar-project">

                <strong className="top-project-name">
                    {projectName}
                </strong>

                <span className="top-project-add">
                    +
                </span>

                <span className="top-project-separator">
                    •
                </span>

                <span className="top-project-status">
                    Guardado hace 2 min
                </span>

            </div>


            {/* ACTIONS */}

            <div className="top-bar-actions">
                <select className="top-concurrency-select" aria-label="Maximum concurrent nodes"
                    title="Maximum concurrent nodes" value={maxConcurrency} disabled={isRunning}
                    onChange={event => onConcurrencyChange(Number(event.target.value))}>
                    <option value={1}>Sequential</option>
                    <option value={2}>Parallel ×2</option>
                    <option value={4}>Parallel ×4</option>
                    <option value={8}>Parallel ×8</option>
                </select>

                {/* RUN / STOP */}

                <button
                    className={
                        isRunning
                            ? "top-run-button running"
                            : "top-run-button"
                    }
                    onClick={
                        isRunning
                            ? onStop
                            : onExecute
                    }
                    title={
                        isRunning
                            ? "Detener ejecución"
                            : "Ejecutar sistema"
                    }
                >
                    <span className="top-run-icon">
                        {isRunning ? "■" : "▷"}
                    </span>

                    {isRunning
                        ? "Detener"
                        : "Ejecutar"
                    }
                </button>


                {/* RESET */}

                <button
                    className="top-icon-button"
                    title="Reiniciar ejecución"
                    onClick={onReset}
                    disabled={isRunning}
                >
                    ↺
                </button>


                {/* TOOLS */}

                <div className="top-tools">

                    <button
                        className="top-tool-button"
                        title="Organizar nodos"
                    >
                        ⤨
                    </button>

                    <button
                        className="top-tool-button"
                        title="Ajustar vista"
                    >
                        ⛶
                    </button>

                </div>


                {/* DEPLOY */}

                <button className="top-deploy-button">

                    <span>
                        ♧
                    </span>

                    Desplegar

                </button>


                {/* USER */}

                <button className="top-user-button">

                    <span className="top-user-head" />

                    <span className="top-user-body" />

                </button>

            </div>

        </header>
    )
}


export default TopBar
