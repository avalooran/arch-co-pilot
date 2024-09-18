import './ChatWindow.css';

import { RiChatNewLine } from "react-icons/ri";
import { FaArrowsUpToLine } from "react-icons/fa6";
import { CiStar } from "react-icons/ci";
import ChatInput from './ChatInput';
import Chat from './Chat';
import { useRef, useState } from 'react';
import { searchApiUrl } from '../constants/request';

function ChatWindow({ isSubHeaderOpen, toggleSubHeaderOpen }) {
    const [chatItems, updateChatItems] = useState([]);
    const [disableTextArea, updateDisableTextArea] = useState(false);
    const chatItemsRef = useRef(chatItems);
    chatItemsRef.current = chatItems;
    const onSearch = (searchText) => {
        const searchedInput = searchText.trim();
        updateChatItems([...chatItemsRef.current, {
            message: searchedInput,
            isBot: false
        }]);
        getResponse(searchedInput);
    }
    const getResponse = (searchedInput) => {
        updateDisableTextArea(true);
        const headers = {
            userid: 'TestUserId',
            sessionid: 'TestSessionId',
            eventdatetime: new Date(),
            conversationtopic: 'TestConversationTopic',
            "Content-Type": "application/json"
        };
        const requestBody = {
            "userQuestion": searchedInput,
            "addHocDocumentPath": ""
        };
        fetch(searchApiUrl, { method: 'POST', headers, body: JSON.stringify(requestBody) })
            .then(res => res.json())
            .then(res => {
                console.log(res);
                insertBotsResponse(res.answer);
        })
            .catch((err) => {
                console.log("Err", err);
            });

    }
    const insertBotsResponse = (responseMsg) => {
        setTimeout(() => {
            updateChatItems([...chatItemsRef.current, {
                message: "...",
                isBot: true
            }]);
        }, 10);

        for (let i = 0; i < responseMsg.length; i++) {
            setTimeout(() => {
                updateChatItems(chatItemsRef.current.map((x, ind) => {
                    if (ind == chatItemsRef.current.length - 1)
                        return { message: responseMsg.substring(0, i + 1), isBot: true }
                    else
                        return x;
                }));
                if (i == responseMsg.length - 1)
                    updateDisableTextArea(false);
            }, 100 + (i * 5));
        }
    }
    return (
        <div id="chatwindow-wrapper">
            <div id="chat-header">
                {isSubHeaderOpen ?
                    <div>
                        <FaArrowsUpToLine
                            size={25}
                            color={"gray"}
                            onClick={toggleSubHeaderOpen}
                        />
                    </div>
                    :
                    <div>
                        <CiStar
                            size={30}
                            color={"gray"}
                            onClick={toggleSubHeaderOpen}
                        />
                    </div>
                }
                <div>
                    <RiChatNewLine
                        size={25}
                        color={"gray"}
                        onClick={() => updateChatItems([])}
                    />
                </div>
            </div>
            <div id="chat-body">
                <Chat chatItems={chatItems} />
            </div>
            <div id="chat-footer">
                <ChatInput onSearch={onSearch} disableTextArea={disableTextArea} />
            </div>
        </div>
    )
}

export default ChatWindow;