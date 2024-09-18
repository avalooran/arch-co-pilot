import './ChatWindow.css';
import { RiChatNewLine } from "react-icons/ri";


function ChatWindow() {
    return (
        <div id="chatwindow-wrapper">
            <div id="chat-header">
                <RiChatNewLine size={27} color={"gray"} />
            </div>
            <div id="chat-body"></div>
            <div id="chat-footer"></div>
        </div>
    )
}

export default ChatWindow;