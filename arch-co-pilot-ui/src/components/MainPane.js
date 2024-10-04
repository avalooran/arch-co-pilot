import { useState } from 'react';
import { TbWindowMaximize } from "react-icons/tb";
import { FaStar } from "react-icons/fa";
import { PiAtomFill } from "react-icons/pi";
import './MainPane.css';
import { APP_MENU, APP_NAME, FAVORITE_QUESTION, FAVORITE_TOPIC } from '../constants/app';
import ChatWindow from './ChatWindow';


function MainPane({
    isSidePaneClose,
    toggleSidePaneClose,
    topicSuggestionList,
    questionFavList,
    selectedQuestion,
    chatItems,
    triggerUpdateChatItems,
    updateSelectedTopic,
    updateSelectedQuestion,
    addToFav
}) {
    const [isSubHeaderOpen, updateIsSubHeaderOpen] = useState(false);
    const [activeSubHeaderTab, updateActiveSubHeaderTab] = useState(FAVORITE_QUESTION);
    const toggleSubHeaderOpen = () => {
        updateIsSubHeaderOpen(!isSubHeaderOpen);
    }
    return (
        <div id="mainpane-wrapper" className="full-vh">
            <div className="full-vh">
                <div id="mainpane-header">
                    <div id="app-name">
                        {isSidePaneClose ?
                            <div title="Show Topics History">
                                <TbWindowMaximize
                                    size={32}
                                    color={"white"}
                                    style={{ cursor: 'pointer' }}
                                    onClick={toggleSidePaneClose}
                                />
                            </div>
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
                    <div id="mainpane-subheader-tab">
                        <div onClick={() => updateActiveSubHeaderTab(FAVORITE_TOPIC)} className={`${activeSubHeaderTab === FAVORITE_TOPIC ? "active": ""}`}>Topics</div>
                        <div onClick={() => updateActiveSubHeaderTab(FAVORITE_QUESTION)}  className={`${activeSubHeaderTab === FAVORITE_QUESTION ? "active": ""}`}>Questions</div>
                    </div>
                    <div id="question-suggestion-wrapper">
                        <div id="question-suggestion-icon">
                            <FaStar
                                size={35}
                                color={"black"}
                            />
                        </div>

                        <div id="question-suggestions">
                            {activeSubHeaderTab === FAVORITE_TOPIC && topicSuggestionList && topicSuggestionList.map((x, ind) => (
                                <div key={`question-suggestion-${ind}`} onClick={() => updateSelectedTopic(x.topicId)} >
                                    {x.topic}
                                </div>
                            ))}
                            {activeSubHeaderTab === FAVORITE_QUESTION && questionFavList && questionFavList.map((x, ind) => (
                                <div key={`question-suggestion-${ind}`} onClick={() => updateSelectedQuestion(x.searchText)} >
                                    {x.searchText}
                                </div>
                            ))}
                        </div>
                        {/* <div style={{height: '100px', width: '100%', background: 'green'}}></div> */}
                    </div>
                </div>
                <div id="mainpane-chatwindow">
                    <ChatWindow
                        isSubHeaderOpen={isSubHeaderOpen}
                        toggleSubHeaderOpen={toggleSubHeaderOpen}
                        chatItems={chatItems}
                        selectedQuestion={selectedQuestion}
                        triggerUpdateChatItems={triggerUpdateChatItems}
                        updateSelectedQuestion={updateSelectedQuestion}
                        addToFav={addToFav}
                    />
                </div>
            </div>
        </div>
    )
}
export default MainPane;