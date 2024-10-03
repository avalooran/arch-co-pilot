import { useEffect, useRef } from 'react';
import { PiAtomFill } from "react-icons/pi";
import { CiFileOn } from "react-icons/ci";
import './Chat.css';
import { getDateWithTime } from '../utils/common';
import { LuStar, LuCopy, LuRefreshCw } from "react-icons/lu";

function Chat({ chatItems, botToRespond }) {
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
                        <div className={"chat-item " + (x.isBot ? "bot" : "")} key={"chatItem-" + ind} ref={ind === chatItems.length - 1 ? messagesEndRef : null}>
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
                            <div>
                                <div className="chat-msg">
                                    {x.type === 'complex' ?
                                        <div>
                                            {x.message.map((msg, msgInd) => (
                                                <div key={`msg-${ind}-${msgInd}`}>
                                                    <div>{msg.text_response}</div>
                                                    {msg.image_response.length > 0 && msg.image_response.map((msgImg, msgImgInd) => {
                                                        if (msgImg.hasOwnProperty("image_description") && msgImg.hasOwnProperty("image_summary")) {
                                                            return (
                                                                <div className="chat-msg-img-wrapper" key={`msg-img-${ind}-${msgInd}-${msgImgInd}`}>
                                                                    <div><b>{msgImg.image_description}</b></div>
                                                                    <div>{msgImg.image_summary}</div>
                                                                    <div><img src={`data:image/png;base64, ${msgImg.image_base64}`} alt={msgImg.image_base64} /></div>
                                                                </div>
                                                            )
                                                        }
                                                    })}
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
                                    <div>

                                    </div>                                
                                </div>
                                <div className="chat-msg-ts">{getDateWithTime(x.ts)}</div>
                            </div>
                            <div class="chat-msg-icon-wrapper">
                                {!x.isBot &&<div title="Add question to favorites">
                                    <LuStar
                                        size={18}
                                        color={"gray"}
                                        onClick={() => {}}
                                    />
                                </div>}
                                {!x.isBot &&<div title="Ask again">
                                    <LuRefreshCw 
                                        size={18}
                                        color={"gray"}
                                        onClick={() => {}}
                                    />
                                </div>}
                                {x.isBot && <div title="Copy text">
                                    <LuCopy
                                        size={18}
                                        color={"gray"}
                                        onClick={() => {}}
                                    />
                                </div>}
                            </div>
                        </div>
                    )
                })}
                            {botToRespond &&
                                <div className="loading-icon">
                                    <PiAtomFill
                                        size={40}
                                        color={"#0E5447"}
                                    />
                                </div>
                            }
                        </div>
        </div>
            );
}

            export default Chat;
