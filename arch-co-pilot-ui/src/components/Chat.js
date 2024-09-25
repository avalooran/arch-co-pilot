import { useEffect, useRef } from 'react';
import { PiAtomFill } from "react-icons/pi";
import { CiFileOn } from "react-icons/ci";
import './Chat.css';

function Chat({ chatItems, updateBotToRespond }) {
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
                            <div className="chat-msg">
                                {x.type == 'complex' ?
                                    <div>
                                        {x.message.map((msg, msgInd) => (
                                            <div key={`msg-${ind}-${msgInd}`}>
                                                <div>{msg.text_response}</div>
                                                {msg.image_response?.map((msgImg, msgImgInd) => (
                                                    <div key={`msg-img-${ind}-${msgInd}-${msgImgInd}`}>
                                                        <div><b>{msgImg.image_description}</b></div>
                                                        <div>{msgImg.image_summary}</div>
                                                        <div><img src={msgImg.image_base64} alt={msgImg.image_base64} /></div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                    :
                                    <div>{x.message}</div>
                                }
                                {x?.uploadDoc?.name &&
                                    <div className="uploaded-file" title={`File - ${x.uploadDoc.name} (Size - ${x.uploadDoc.size})`}>
                                        <div>
                                            <CiFileOn />
                                        </div>
                                        <div>
                                            {x.uploadDoc.name}
                                        </div>

                                    </div>}
                            </div>
                        </div>
                    )
                })}
                {updateBotToRespond || true ? 
                    <img></img>
                :
                    null
                }
            </div>
        </div>
    );
}

export default Chat;
