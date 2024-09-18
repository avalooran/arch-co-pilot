import './SidePane.css';
import { useState } from 'react';
import { TbWindowMinimize } from "react-icons/tb";

function SidePane({isSidePaneClose, toggleSidePaneClose}) {
    const [isOnHover, updateIsOnHover] = useState(false);    
    return (
        <div id="sidepane-wrapper" className={`full-vh ${isSidePaneClose? "close": ""}`}>
            <div id="sidepane-header">
                <div>
                    <TbWindowMinimize 
                        size={32}
                        color={isOnHover? "black": "gray"}
                        style={{cursor: 'pointer'}}
                        onMouseOver={()=> updateIsOnHover(true)}
                        onMouseOut={() => updateIsOnHover(false)}
                        onClick={toggleSidePaneClose}
                    />
                    </div>
            </div>
        </div>
    )
}
export default SidePane;