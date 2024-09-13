import { useState } from 'react';
import './Chat.css';
import { chatItemsMock } from '../constants/mock';

function Chat() {
  const [chatItems, updateChatItems] = useState(chatItemsMock);
  return (
    <div className="chat">
        <div className="chat-items-wrapper">
            {chatItems.map(x => {
                return (
                    <div className={"chat-item " + (x.isBot ? "bot": "")}>
                        <div className="chat-msg">{x.message}</div>
                    </div>
                )
            })}
        </div>
    </div>
  );
}

export default Chat;
