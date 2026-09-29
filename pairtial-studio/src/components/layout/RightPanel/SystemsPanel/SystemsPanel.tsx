import "./SystemsPanel.css"

import {
    useState
} from "react"

import {
    useSystemStore
} from "../../../../stores/systemStore"


export function SystemsPanel() {

    const [
        search,
        setSearch
    ] = useState("")


    const systems =
        useSystemStore(
            state =>
                state.systems
        )


    const activeSystemId =
        useSystemStore(
            state =>
                state.activeSystemId
        )


    const createSystem =
        useSystemStore(
            state =>
                state.createSystem
        )


    const selectSystem =
        useSystemStore(
            state =>
                state.selectSystem
        )


    const filteredSystems =
        systems.filter(
            system =>
                system.name
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    )
        )


    function formatModified(
        timestamp: number
    ) {

        const date =
            new Date(timestamp)


        return `Modificado ${
            date.toLocaleDateString()
        } ${
            date.toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )
        }`
    }


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
                        value={search}
                        onChange={
                            event =>
                                setSearch(
                                    event.target.value
                                )
                        }
                    />

                </div>


                <button
                    className="systems-new-btn"
                    onClick={
                        createSystem
                    }
                >

                    <span>
                        +
                    </span>

                    Nuevo

                </button>

            </div>


            <div className="systems-list">

                {filteredSystems.length === 0 && (

                    <div className="systems-empty">
                        No hay sistemas.
                    </div>

                )}


                {filteredSystems.map(
                    system => (

                        <button
                            key={
                                system.id
                            }
                            className={
                                `system-item ${
                                    system.id ===
                                    activeSystemId
                                        ? "selected"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                selectSystem(
                                    system.id
                                )
                            }
                        >

                            <div
                                className="system-icon"
                                style={{
                                    background:
                                        "#85ccff"
                                }}
                            >
                                🤖
                            </div>


                            <div className="system-info">

                                <span className="system-name">
                                    {system.name}
                                </span>

                                <span className="system-modified">
                                    {
                                        formatModified(
                                            system.updatedAt
                                        )
                                    }
                                </span>

                            </div>


                            <span className="system-options">
                                ⋮
                            </span>

                        </button>

                    )
                )}

            </div>

        </section>
    )
}


export default SystemsPanel