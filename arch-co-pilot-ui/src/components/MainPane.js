import { useState } from 'react';
import { TbWindowMaximize } from "react-icons/tb";
import { FaStar } from "react-icons/fa";
import { PiAtomFill } from "react-icons/pi";
import './MainPane.css';
import { APP_MENU_1, APP_MENU_2, APP_NAME, FAVORITE_QUESTION, FAVORITE_TOPIC, MAX_SUGGESTIONS, MAX_SUGGESTIONS_PER_PAGE } from '../constants/app';
import ChatWindow from './ChatWindow';
import { GoDot, GoDotFill } from "react-icons/go";

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
    addToFav,
    botToRespond,
    updateBotToRespond
}) {
    const [isSubHeaderOpen, updateIsSubHeaderOpen] = useState(false);
    const [activeSubHeaderTab, updateActiveSubHeaderTab] = useState(FAVORITE_QUESTION);
    const [currentSuggestionPage, updateCurrentSuggestionPage] = useState(0);
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
                        <div className="navbar">
                            <div className="dropdown">
                                <button className="dropbtn">PowerBI Dashboards</button>
                                <div className="dropdown-content">
                                    {APP_MENU_1.map((x, ind) => (
                                        <a key={`app-menu-${ind}`} href={x.link} target='_blank' rel="noopener noreferrer">
                                            {x.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <div className="dropdown">
                                <button className="dropbtn">COE Resources</button>
                                <div className="dropdown-content">
                                    {APP_MENU_2.map((x, ind) => (
                                        <a key={`app-menu-${ind}`} href={x.link} target='_blank' rel="noopener noreferrer">
                                            {x.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="mainpane-subheader" className={`${isSubHeaderOpen ? 'open' : 'close'}`}>
                    <div id="mainpane-subheader-tab">
                        {/* <div onClick={() => updateActiveSubHeaderTab(FAVORITE_TOPIC)} className={`${activeSubHeaderTab === FAVORITE_TOPIC ? "active": ""}`}>Topics</div> */}
                        <div onClick={() => updateActiveSubHeaderTab(FAVORITE_QUESTION)} className={`${activeSubHeaderTab === FAVORITE_QUESTION ? "active" : ""}`}>
                            <span>Questions</span>
                            <span>
                                <FaStar
                                    size={15}
                                    color={"white"}
                                />
                            </span>
                        </div>
                    </div>
                    <div id="question-suggestion-wrapper">
                        <div id="question-suggestions">
                            {/* {activeSubHeaderTab === FAVORITE_TOPIC && topicSuggestionList && topicSuggestionList.map((x, ind) => (
                                <div key={`question-suggestion-${ind}`} title={x.topic} onClick={() => !botToRespond && updateSelectedTopic(x.topicId)} >
                                    <div>{x.topic}</div>
                                </div>
                            ))} */}
                            {activeSubHeaderTab === FAVORITE_QUESTION && questionFavList && questionFavList.slice((currentSuggestionPage * MAX_SUGGESTIONS_PER_PAGE), (currentSuggestionPage * MAX_SUGGESTIONS_PER_PAGE) + MAX_SUGGESTIONS_PER_PAGE).map((x, ind) => (
                                <div key={`question-suggestion-${ind}`} title={x.searchText} onClick={() => !botToRespond && updateSelectedQuestion(x.searchText)} >
                                    <div>{x.searchText}</div>
                                </div>
                            ))}
                        </div>
                        <div id="suggestion-carousel-controller">
                            {[...Array(MAX_SUGGESTIONS / MAX_SUGGESTIONS_PER_PAGE)].map((_, ind) =>
                                ind !== currentSuggestionPage ?
                                    (
                                        <GoDot
                                            size={25}
                                            color={"orange"}
                                            onClick={() => updateCurrentSuggestionPage(ind)}
                                        />
                                    )
                                    :
                                    (
                                        <GoDotFill
                                            size={25}
                                            color={"orange"}
                                            onClick={() => updateCurrentSuggestionPage(ind)}
                                        />
                                    )
                            )}
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
                        botToRespond={botToRespond}
                        updateBotToRespond={updateBotToRespond}
                    />
                </div>
            </div>
        </div>
    )
}
export default MainPane;