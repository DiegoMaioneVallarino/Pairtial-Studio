import "./SystemsPanel.css"


type SystemItem = {
    id: number
    name: string
    modified: string
    color: string
    icon: string
}


const systems: SystemItem[] = [
    {
        id: 1,
        name: "PixelMathness AI",
        modified: "Modificado hoy 08:12 p. m.",
        color: "#85ccff",
        icon: "🤖"
    },
    {
        id: 2,
        name: "News Intelligence",
        modified: "Modificado 8/09/2026",
        color: "#ffbac9",
        icon: "📰"
    },
    {
        id: 3,
        name: "Research Lab",
        modified: "Modificado 7/09/2026",
        color: "#8077ff",
        icon: "🔬"
    },
    {
        id: 4,
        name: "Customer Service",
        modified: "Modificado 5/09/2026",
        color: "#4f5289",
        icon: "👩‍💼"
    },
    {
        id: 5,
        name: "Finance Analyzer",
        modified: "Modificado 1/09/2026",
        color: "#40566d",
        icon: "📊"
    }
]


export function SystemsPanel() {

    return (
        <section className="systems-panel">

            <div className="systems-panel-toolbar">

                <div className="systems-search">

                    <span className="systems-search-icon">
                        ⌕
                    </span>

                    <input
                        type="text"
                        placeholder="Buscar sistemas..."
                    />

                </div>


                <button className="systems-new-btn">

                    <span>
                        +
                    </span>

                    Nuevo

                </button>

            </div>


            <div className="systems-list">

                {systems.map((
                    system,
                    index
                ) => (

                    <button
                        key={system.id}
                        className={
                            `system-item ${
                                index === 0
                                    ? "selected"
                                    : ""
                            }`
                        }
                    >

                        <div
                            className="system-icon"
                            style={{
                                background:
                                    system.color
                            }}
                        >
                            {system.icon}
                        </div>


                        <div className="system-info">

                            <span className="system-name">
                                {system.name}
                            </span>

                            <span className="system-modified">
                                {system.modified}
                            </span>

                        </div>


                        <span className="system-options">
                            ⋮
                        </span>

                    </button>

                ))}

            </div>

        </section>
    )
}