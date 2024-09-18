import { useState } from 'react';
import { APP_MENU, APP_NAME } from '../constants/app';
import { questionSuggestions } from '../constants/mock';
import ChatWindow from './ChatWindow';
import { TbWindowMinimize } from "react-icons/tb";
import './MainPane.css';

function MainPane({isSidePaneClose, toggleSidePaneClose}) {
    const [isOnHover, updateIsOnHover] = useState(false); 
    return (
        <div id="mainpane-wrapper" className="full-vh">
            <div>
                <div id="mainpane-header">
                    {isSidePaneClose ? 
                        <TbWindowMinimize 
                        size={32}
                        color={isOnHover? "black": "gray"}
                        style={{cursor: 'pointer'}}
                        onMouseOver={()=> updateIsOnHover(true)}
                        onMouseOut={() => updateIsOnHover(false)}
                        onClick={toggleSidePaneClose}
                    />
                    : null}
                    <div id="app-name">
                        <span>{APP_NAME}</span>
                    </div>
                    <div id="app-menu">
                        {APP_MENU.map((x, ind) => (
                            <div key={`app-menu-${ind}`}>
                                {x.label}
                            </div>
                        ))}
                    </div>
                </div>
                <div id="mainpane-subheader">
                    <div id="question-suggestion-wrapper">
                        <div>
                            {questionSuggestions.map((x, ind) => (
                                <div key={`question-suggestion-${ind}`}>
                                    {x.topic}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div id="mainpane-chatwindow">
                   <ChatWindow />
                </div>
            </div>
        </div>
    )
}
export default MainPane;