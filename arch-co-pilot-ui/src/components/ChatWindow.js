import { useRef, useState } from 'react';
import { RiChatNewLine } from "react-icons/ri";
import { FaArrowsUpToLine } from "react-icons/fa6";
import { CiStar } from "react-icons/ci";
import './ChatWindow.css';
import ChatInput from './ChatInput';
import Chat from './Chat';
import { getResponseForQuestionApi } from '../utils/request';

function ChatWindow({ isSubHeaderOpen, toggleSubHeaderOpen, saveTopic, selectedTopic }) {
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
        updateDisableTextArea(true);
        triggerResponse(searchedInput, uploadedFile ? `${uploadedFile.name} - YetToIntegrateS3FileUploadService` : "");
    }
    const triggerResponse = async (userQuestion, addHocDocumentPath) => {
        insertBotResponse("pre", null)
        const apiResponse = await getResponseForQuestionApi({ userQuestion, addHocDocumentPath });
        if (apiResponse.status)
            insertBotResponse("actual", apiResponse.data?.answer);
        else
            insertBotResponse("actual", `Oops Something went wrong. Please try again.`);
    }
    const insertBotResponse = (type, response) => {
        if (type === "pre") {
            setTimeout(() => {
                updateChatItems([...chatItemsRef.current, {
                    message: "...",
                    isBot: true
                }]);
            }, 10);
        }
        else {
            for (let i = 0; i < response.length; i++) {
                setTimeout(() => {
                    updateChatItems(chatItemsRef.current.map((x, ind) => {
                        if (ind === chatItemsRef.current.length - 1)
                            return { message: response.substring(0, i + 1), isBot: true }
                        else
                            return x;
                    }));
                    if (i === response.length - 1)
                        updateDisableTextArea(false);
                }, 100 + (i * 5));
            }
        }
    }
    const createNewChat = () => {
        if (chatItems.length > 0)
            saveTopic(chatItems);

        updateChatItems([]);
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
                        onClick={createNewChat}
                    />
                </div>
            </div>
            <div id="chat-body">
                <Chat chatItems={chatItems} />
            </div>
            <div id="chat-footer">
                <ChatInput onSearch={onSearch} disableTextArea={disableTextArea} selectedTopic={selectedTopic} createNewChat={createNewChat} />
            </div>
        </div>
    )
}

export default ChatWindow;