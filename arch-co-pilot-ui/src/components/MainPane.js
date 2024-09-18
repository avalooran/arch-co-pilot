import { APP_MENU, APP_NAME } from '../constants/app';
import { questionSuggestions } from '../constants/mock';
import ChatWindow from './ChatWindow';
import { TbWindowMinimize } from "react-icons/tb";
import { FaStar } from "react-icons/fa";
import { PiAtomFill } from "react-icons/pi";
import './MainPane.css';
import { useState } from 'react';

function MainPane({ isSidePaneClose, toggleSidePaneClose }) {
    const [isSubHeaderOpen, updateIsSubHeaderOpen] = useState(true);
    const toggleSubHeaderOpen = () => {
        updateIsSubHeaderOpen(!isSubHeaderOpen);
    }
    return (
        <div id="mainpane-wrapper" className="full-vh">
            <div className="full-vh">
                <div id="mainpane-header">
                    <div id="app-name">
                        {isSidePaneClose ?
                            <TbWindowMinimize
                                size={32}
                                color={"gray"}
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
                            <div key={`app-menu-${ind}`}>
                                {x.label}
                            </div>
                        ))}
                    </div>
                </div>
                <div id="mainpane-subheader" className={`${isSubHeaderOpen ? 'open' : 'close'}`}>
                    <div id="question-suggestion-wrapper">
                        <div id="question-suggestion-icon" style={{width: '10%'}}>
                            <FaStar 
                                size={25}
                                color={"gray"}
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