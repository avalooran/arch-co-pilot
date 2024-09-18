import './ChatWindow.css';
import { RiChatNewLine } from "react-icons/ri";
import { FaArrowsUpToLine } from "react-icons/fa6";
import { BsFillQuestionSquareFill } from "react-icons/bs";
import { FaStarHalf } from "react-icons/fa";

function ChatWindow({ isSubHeaderOpen, toggleSubHeaderOpen }) {
    return (
        <div id="chatwindow-wrapper">
            <div id="chat-header">
                {isSubHeaderOpen ?
                    <div>
                        <FaArrowsUpToLine
                            size={27}
                            color={"gray"}
                            onClick={toggleSubHeaderOpen}
                        />
                    </div>
                    :
                    <div>
                        <FaStarHalf
                            size={30}
                            color={"gray"}
                            onClick={toggleSubHeaderOpen}
                        />
                    </div>
                }
                <div>
                    <RiChatNewLine
                        size={27}
                        color={"gray"}

                    />
                </div>
            </div>
            <div id="chat-body">
                <div></div>
            </div>
            <div id="chat-footer">

            </div>
        </div>
    )
}

export default ChatWindow;