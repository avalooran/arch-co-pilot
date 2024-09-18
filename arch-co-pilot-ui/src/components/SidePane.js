import './SidePane.css';
import { TbWindowMinimize } from "react-icons/tb";

function SidePane({ isSidePaneClose, toggleSidePaneClose }) {
    return (
        <div id="sidepane-wrapper" className={`full-vh ${isSidePaneClose ? "close" : "open"}`}>
            <div id="sidepane-header">
                <div>
                    <TbWindowMinimize
                        key={"sidePane-minmize" + Date.now()}
                        size={32}
                        color={"gray"}
                        style={{ cursor: 'pointer' }}
                        onClick={toggleSidePaneClose}
                    />
                </div>
            </div>
        </div>
    )
}
export default SidePane;