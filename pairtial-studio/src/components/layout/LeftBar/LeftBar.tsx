import "./LeftBar.css"

type LeftBarButtonsTypes =  
    | "selection"
    | "agent"
    | "api"
    | "fabrics"
type LeftBarProps = {
    selectedButton: LeftBarButtonsTypes
}
function LeftBar({
    selectedButton
}: LeftBarProps) {

    return (
        <div id="LeftBar">
            <div className="LeftBarInner">

            
            <div
                className={`tools-bt ${selectedButton === "selection" ? "select" : ""}`}
                id="tool-selection"
            />

            <div
                className={`tools-bt ${selectedButton === "agent" ? "select" : ""}`}
                id="tool-agent"
            />

            <div
                className={`tools-bt ${selectedButton === "api" ? "select" : ""}`}
                id="tool-api"
            />

            <div
                className={`tools-bt ${selectedButton === "fabrics" ? "select" : ""}`}
                id="tool-fabrics"
            />
             <div
                className={`tools-bt ${selectedButton === "fabrics" ? "select" : ""}`}
                id="tool-fabrics"
            />
             <div
                className={`tools-bt ${selectedButton === "fabrics" ? "select" : ""}`}
                id="tool-fabrics"
            />
             <div
                className={`tools-bt ${selectedButton === "fabrics" ? "select" : ""}`}
                id="tool-fabrics"
            />
             <div
                className={`tools-bt ${selectedButton === "fabrics" ? "select" : ""}`}
                id="tool-fabrics"
            />
             <div
                className={`tools-bt ${selectedButton === "fabrics" ? "select" : ""}`}
                id="tool-fabrics"
            />
             <div
                className={`tools-bt ${selectedButton === "fabrics" ? "select" : ""}`}
                id="tool-fabrics"
            />
             <div
                className={`tools-bt ${selectedButton === "fabrics" ? "select" : ""}`}
                id="tool-fabrics"
            />
            
            </div>
        </div>
    )

}
export default LeftBar

