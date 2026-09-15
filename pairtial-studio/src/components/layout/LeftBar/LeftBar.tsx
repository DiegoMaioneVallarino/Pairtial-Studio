import "./LeftBar.css"


export type LeftBarButtonsTypes =
    | "agent"
    | "api"
    | "fabrics"
    | "quality"
    | "engineer"
    | "supervisor"
    | "hr"


type LeftBarProps = {

    selectedButton:
        LeftBarButtonsTypes | null

    onSelectButton:
        (button: LeftBarButtonsTypes | null) => void

}


function LeftBar({

    selectedButton,
    onSelectButton

}: LeftBarProps) {


    function handleButtonClick(
        button: LeftBarButtonsTypes
    ) {

        /*
            Si vuelves a pulsar el botón seleccionado,
            regresamos al modo normal.
        */

        if (selectedButton === button) {

            onSelectButton(null)

            return
        }


        onSelectButton(button)
    }


    return (

        <div id="LeftBar">

            <div className="LeftBarInner">


                {/* AGENT */}

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
/>


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
/>


{/* FABRIC */}

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
/>


{/* QUALITY */}

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
/>


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
/>


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
/>


{/* HR */}

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
/>


            </div>

        </div>
    )
}


export default LeftBar