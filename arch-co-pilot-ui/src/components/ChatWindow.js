import { useRef, useState } from 'react';
import { RiChatNewLine } from "react-icons/ri";
import { FaArrowsUpToLine } from "react-icons/fa6";
import { CiStar } from "react-icons/ci";
import './ChatWindow.css';
import ChatInput from './ChatInput';
import Chat from './Chat';
import { searchApiUrl } from '../constants/request';

function ChatWindow({ isSubHeaderOpen, toggleSubHeaderOpen }) {
    const [chatItems, updateChatItems] = useState([]);
    const [disableTextArea, updateDisableTextArea] = useState(false);
    const chatItemsRef = useRef(chatItems);
    chatItemsRef.current = chatItems;
    const onSearch = (searchText, uploadedFile) => {
        const searchedInput = searchText.trim();
        updateChatItems([...chatItemsRef.current, {
            message: searchedInput,
            uploadDoc: uploadedFile,
            isBot: false
        }]);
        if(uploadedFile) {
            // To Integrate with API that saves file in S3 and returns the S3 link
            getResponse(searchedInput, "YetToIntegrateS3FileUploadService")
        }
        else
            getResponse(searchedInput, "");
    }
    const getResponse = (userQuestion, addHocDocumentPath) => {
        updateDisableTextArea(true);
        const headers = {
            userid: 'TestUserId',
            sessionid: 'TestSessionId',
            eventdatetime: new Date(),
            conversationtopic: 'TestConversationTopic',
            "Content-Type": "application/json"
        };
        const requestBody = {
            userQuestion,
            addHocDocumentPath
        };
        fetch(searchApiUrl, { method: 'POST', headers, body: JSON.stringify(requestBody) })
            .then(res => res.json())
            .then(res => {
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
                            color={"black"}
                            onClick={toggleSubHeaderOpen}
                        />
                    </div>
                    :
                    <div>
                        <CiStar
                            size={30}
                            color={"black"}
                            onClick={toggleSubHeaderOpen}
                        />
                    </div>
                }
                <div>
                    <RiChatNewLine
                        size={25}
                        color={"black"}
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