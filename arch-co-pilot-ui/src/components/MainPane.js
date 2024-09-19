import { useState } from 'react';
import { TbWindowMaximize } from "react-icons/tb";
import { FaStar } from "react-icons/fa";
import { PiAtomFill } from "react-icons/pi";
import './MainPane.css';
import { APP_MENU, APP_NAME } from '../constants/app';
import { questionSuggestions } from '../constants/mock';
import ChatWindow from './ChatWindow';


function MainPane({ isSidePaneClose, toggleSidePaneClose }) {
    const [isSubHeaderOpen, updateIsSubHeaderOpen] = useState(false);
    const toggleSubHeaderOpen = () => {
        updateIsSubHeaderOpen(!isSubHeaderOpen);
    }
    return (
        <div id="mainpane-wrapper" className="full-vh">
            <div className="full-vh">
                <div id="mainpane-header">
                    <div id="app-name">
                        {isSidePaneClose ?
                            <TbWindowMaximize
                                size={32}
                                color={"white"}
                                style={{ cursor: 'pointer' }}
                                onClick={toggleSidePaneClose}
                            />
                            :
                            null
                        }
                        <span>{APP_NAME}</span>
                        <PiAtomFill
                            size={26}
                        />
                    </div>
                    <div id="app-menu">
                        {APP_MENU.map((x, ind) => (
                            <div key={`app-menu-${ind}`} onClick={() => window.open(x.link)}>
                                {x.label}
                            </div>
                        ))}
                    </div>
                </div>
                <div id="mainpane-subheader" className={`${isSubHeaderOpen ? 'open' : 'close'}`}>
                    <div id="question-suggestion-wrapper">
                        <div id="question-suggestion-icon" style={{ width: '10%' }}>
                            <FaStar
                                size={25}
                                color={"black"}
                            />
                        </div>
                        <div id="question-suggestions" >
                            {questionSuggestions.map((x, ind) => (
                                <div key={`question-suggestion-${ind}`}>
                                    {x.topic}
                                </div>
                            ))}
                        </div>
                        {/* <div style={{height: '100px', width: '100%', background: 'green'}}></div> */}
                    </div>
                </div>
                <div id="mainpane-chatwindow">
                    <ChatWindow isSubHeaderOpen={isSubHeaderOpen} toggleSubHeaderOpen={toggleSubHeaderOpen} />
                </div>
            </div>
        </div>
    )
}
export default MainPane;