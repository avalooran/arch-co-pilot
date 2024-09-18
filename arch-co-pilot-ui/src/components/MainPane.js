import { APP_MENU, APP_NAME } from '../constants/app';
import { questionSuggestions } from '../constants/mock';
import ChatWindow from './ChatWindow';
import { TbWindowMinimize } from "react-icons/tb";
import './MainPane.css';

function MainPane({ isSidePaneClose, toggleSidePaneClose }) {
    return (
        <div id="mainpane-wrapper" className="full-vh">
            <div>
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