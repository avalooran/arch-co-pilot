import { TbWindowMinimize } from "react-icons/tb";
import { MdOutlineTopic } from "react-icons/md";
import { CiTimer } from "react-icons/ci";
import './SidePane.css';

function SidePane({ isSidePaneClose, toggleSidePaneClose, topicHistoryList, botToRespond, updateSelectedTopic, logout }) {
    return (
        <div id="sidepane-wrapper" className={`full-vh ${isSidePaneClose ? "close" : "open"}`}>
            <div id="sidepane-header">
                <div title="Hide Topics History">
                    <TbWindowMinimize
                        size={32}
                        color={"black"}
                        style={{ cursor: 'pointer' }}
                        onClick={toggleSidePaneClose}
                    />
                </div>
            </div>
            <div id="sidepane-body">
                <div id="prev-topic-wrapper">
                    <div id="prev-topic-header">
                        <div>
                            <MdOutlineTopic
                                size={26}
                                color={"gray"}
                            />
                        </div>
                        <div>Topics</div>
                    </div>
                    <div id="prev-topic-body">
                        <div>
                            {topicHistoryList.map((x, ind) => {
                                return (
                                    <div key={"prev-topic-period-wrapper" + ind}>
                                        <div className="prev-topic-period">
                                            <CiTimer />
                                            <div>{x.period}</div>
                                        </div>
                                        {x.topics.map((y, index) => (
                                            <div className="prev-topic-period-topic" key={"prev-topic-period-topic-wrapper" + index} onClick={() => !botToRespond && updateSelectedTopic(y.topicId)} >
                                                <div title={y.topic}>{y.topic}</div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div id="sidepane-footer" onClick={logout}>
                Clear Session
            </div>
        </div>
    )
}
export default SidePane;