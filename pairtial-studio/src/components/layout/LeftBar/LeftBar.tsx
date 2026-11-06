import "./LeftBar.css"


export type LeftBarButtonsTypes =
    | "agent"
    | "db"
    | "api"
    | "fabrics"
    | "quality"
    | "engineer"
    | "supervisor"
    | "hr"
    | "king"


type LeftBarProps = {

    selectedButton:
        LeftBarButtonsTypes | null

    onSelectButton:
        (
            button:
                LeftBarButtonsTypes | null
        ) => void

}


function LeftBar({

    selectedButton,
    onSelectButton

}: LeftBarProps) {


    function handleButtonClick(
        button: LeftBarButtonsTypes
    ) {

        if (
            selectedButton === button
        ) {

            onSelectButton(null)

            return
        }

        onSelectButton(button)
    }


    return (

        <div id="LeftBar">

            <div className="LeftBarInner">


                {/* LLM */}

                <div
                    className={`tools-bt ${
                        selectedButton === "agent"
                            ? "select"
                            : ""
                    }`}
                    id="tool-agent"
                    onClick={() =>
                        handleButtonClick("agent")
                    }
                    title="LLM"
                >
                    <img
                        src="/icons/llm_bt.png"
                        alt=""
                    />
                </div>


                {/* QUALITY / VISION */}

                <div
                    className={`tools-bt ${
                        selectedButton === "quality"
                            ? "select"
                            : ""
                    }`}
                    id="tool-quality"
                    onClick={() =>
                        handleButtonClick("quality")
                    }
                    title="Quality Test"
                >
                    <img
                        src="/icons/vis_bt.png"
                        alt=""
                    />
                </div>


                {/* ENGINEER */}

                <div
                    className={`tools-bt ${
                        selectedButton === "engineer"
                            ? "select"
                            : ""
                    }`}
                    id="tool-engineer"
                    onClick={() =>
                        handleButtonClick("engineer")
                    }
                    title="Engineer"
                >
                    <img
                        src="/icons/ngn_bt.png"
                        alt=""
                    />
                </div>


                {/* SUPERVISOR */}

                <div
                    className={`tools-bt ${
                        selectedButton === "supervisor"
                            ? "select"
                            : ""
                    }`}
                    id="tool-supervisor"
                    onClick={() =>
                        handleButtonClick("supervisor")
                    }
                    title="Supervisor"
                >
                    <img
                        src="/icons/spv_bt.png"
                        alt=""
                    />
                </div>


                {/* HUMAN RESOURCES */}

                <div
                    className={`tools-bt ${
                        selectedButton === "hr"
                            ? "select"
                            : ""
                    }`}
                    id="tool-hr"
                    onClick={() =>
                        handleButtonClick("hr")
                    }
                    title="Human Resources"
                >
                    <img
                        src="/icons/hhm_bt.png"
                        alt=""
                    />
                </div>


                <div className="tools-divider" />


                {/* DATABASE */}

                <div
                    className={`tools-bt ${
                        selectedButton === "db"
                            ? "select"
                            : ""
                    }`}
                    id="tool-db"
                    onClick={() =>
                        handleButtonClick("db")
                    }
                    title="Database"
                >
                    <img
                        src="/icons/db_bt.png"
                        alt=""
                    />
                </div>


                {/* API */}

                <div
                    className={`tools-bt ${
                        selectedButton === "api"
                            ? "select"
                            : ""
                    }`}
                    id="tool-api"
                    onClick={() =>
                        handleButtonClick("api")
                    }
                    title="API"
                >
                    <img
                        src="/icons/api_bt.png"
                        alt=""
                    />
                </div>


                {/* FACTORY / FABRICS */}

                <div
                    className={`tools-bt ${
                        selectedButton === "fabrics"
                            ? "select"
                            : ""
                    }`}
                    id="tool-fabrics"
                    onClick={() =>
                        handleButtonClick("fabrics")
                    }
                    title="Factory"
                >
                    <img
                        src="/icons/fact_bt.png"
                        alt=""
                    />
                </div>


                <div className="tools-spacer" />


                {/* KING */}

                <div
                    className={`tools-bt ${
                        selectedButton === "king"
                            ? "select"
                            : ""
                    }`}
                    id="tool-king"
                    onClick={() =>
                        handleButtonClick("king")
                    }
                    title="King"
                >
                    <img
                        src="/icons/king_bt.png"
                        alt=""
                    />
                </div>


            </div>

        </div>
    )
}


export default LeftBar