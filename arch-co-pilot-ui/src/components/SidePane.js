import './SidePane.css';
import { TbWindowMinimize } from "react-icons/tb";
import { MdOutlineTopic } from "react-icons/md";
import { BsQuestionSquare } from "react-icons/bs";
import { prevTopic } from '../constants/mock';
import { CiTimer } from "react-icons/ci";

function SidePane({ isSidePaneClose, toggleSidePaneClose }) {
    return (
        <div id="sidepane-wrapper" className={`full-vh ${isSidePaneClose ? "close" : "open"}`}>
            <div id="sidepane-header">
                <div>
                    <TbWindowMinimize
                        size={32}
                        color={"gray"}
                        style={{ cursor: 'pointer' }}
                        onClick={toggleSidePaneClose}
                    />
                </div>
            </div>
            <div id="sidepane-body">
                <div id="prev-topic-wrapper">
                    <div id="prev-topic-header">
                            <MdOutlineTopic 
                                size={26}
                                color={"gray"}
                            />
                            <div>Topics</div>
                    </div>
                    <div id="prev-topic-body">
                        <div>
                        {prevTopic.map((x, ind) => {
                                return (
                                    <div key={"prev-topic-period-wrapper" + ind}>
                                        <div className="prev-topic-period">
                                            <CiTimer />
                                            <div>{x.period}</div>
                                        </div>
                                        {x.topic.map((y, index) => (
                                            <div className="prev-topic-period-topic" key={"prev-topic-period-topic-wrapper" + index}>
                                                <div>{y.topic}</div> 
                                            </div>
                                        ))}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div id="sidepane-footer">
                About us
            </div>
        </div>
    )
}
export default SidePane;