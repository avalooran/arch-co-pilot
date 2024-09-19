import { useEffect, useRef } from 'react';
import './Chat.css';
import { PiAtomFill } from "react-icons/pi";


function Chat({ chatItems }) {
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    useEffect(() => {
        scrollToBottom();
    }, [chatItems]);
    return (
        <div className="chat">
            <div className="chat-items-wrapper">
                {chatItems.map((x, ind) => {
                    return (
                        <div className={"chat-item " + (x.isBot ? "bot" : "")} key={"chatItem-" + ind} ref={ind == chatItems.length - 1 ? messagesEndRef : null}>
                            {x.isBot ?
                                (
                                    <div>
                                        <PiAtomFill
                                        size={25}
                                        color={"#0E5447"}
                                        />
                                    </div>  
                                )
                                :
                                null
                            }
                            <div className="chat-msg">{x.message}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

export default Chat;
