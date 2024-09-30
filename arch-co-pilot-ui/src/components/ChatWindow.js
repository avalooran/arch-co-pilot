import { useEffect, useRef, useState } from 'react';
import { RiChatNewLine } from "react-icons/ri";
import { FaArrowsUpToLine } from "react-icons/fa6";
import { CiStar } from "react-icons/ci";
import './ChatWindow.css';
import ChatInput from './ChatInput';
import Chat from './Chat';
import { getFilePathApi, getResponseForQuestionApi, uploadFileToS3Api } from '../utils/request';
import { buildS3GetUrl, getCurrentTs } from '../utils/common';
import { getChatHistoryFromStorage } from '../utils/app';

function ChatWindow({ isSubHeaderOpen, toggleSubHeaderOpen, saveTopic, prioritizeTopic, selectedTopic, updateSelectedTopic, chatItems, updateChatItems }) {
    const [searchText, updateSearchText] = useState("");
    const [selectedFile, updateSelectedFile] = useState(null);
    const [botToRespond, updateBotToRespond] = useState(false);

    const fileUploadRef = useRef(null);
    const chatItemsRef = useRef();
    chatItemsRef.current = chatItems;

    const onSearch = (searchText, uploadedFile) => {        
        const searchedInput = searchText.trim();
        const chatItemToBeUpdated = {
            message: searchedInput,
            uploadDoc: uploadedFile,
            type: 'simple',
            isBot: false,
            ts: getCurrentTs()
        };
        updateChatItems([...chatItemsRef.current, chatItemToBeUpdated ]);

        triggerApiCalls(searchedInput, uploadedFile);
    }
    const triggerApiCalls = async (searchedInput, uploadedFile) => {
        updateBotToRespond(true);
        if (uploadedFile) {
            const apiResponse = await getFilePathApi({ fileName: uploadedFile.name, fileContent: '' });
            if (apiResponse.status && apiResponse.data && apiResponse.data["url"] && apiResponse.data["url"]["url"] && apiResponse.data["url"]["fields"]) {
                const formData = new FormData();
                Object.entries(apiResponse.data["url"]["fields"]).forEach(function ([key, val]) {
                    formData.append(key, val);
                });
                formData.append("file", uploadedFile)
                const apiResponse1 = await uploadFileToS3Api(apiResponse.data["url"]["url"], formData);
                if (apiResponse1.status) {
                    triggerResponse(searchedInput, buildS3GetUrl(apiResponse.data["url"]["url"], uploadedFile.name));
                }
                else
                    handleBotError();
            }
            else
                handleBotError();
        }
        else
            triggerResponse(searchedInput, "");
    }
    const triggerResponse = async (userQuestion, addHocDocumentPath) => {
        const apiResponse = await getResponseForQuestionApi({ userQuestion, ...(addHocDocumentPath && { addHocDocumentPath }) });
        if (apiResponse.status)
            insertBotResponse("complex", apiResponse.data?.answer);
        else
            handleBotError();
    }
    const handleBotError = () => {
        insertBotResponse("simple", `Oops Something went wrong. Please try again.`);
    }
    const insertBotResponse = (type, response) => {
        prioritizeTopic(selectedTopic);
        switch (type) {
            case "simple":
                setTimeout(() => {
                    updateChatItems([...chatItemsRef.current, {
                        message: "...",
                        uploadDoc: null,
                        type: 'simple',
                        isBot: true,
                        ts: getCurrentTs()
                    }]);
                }, 0);
                for (let i = 0; i < response.length; i++) {
                    setTimeout(() => {
                        updateChatItems(chatItemsRef.current.map((x, ind) => {
                            if (ind === chatItemsRef.current.length - 1)
                                return {
                                    message: response.substring(0, i + 1),
                                    uploadDoc: null,
                                    type: 'simple',
                                    isBot: true,
                                    ts: getCurrentTs()
                                }
                            else
                                return x;
                        }));
                        if (i === response.length - 1)
                            updateBotToRespond(false);
                    }, 100 + (i * 5));
                }
                break;
            case "complex":
                updateBotToRespond(false);
                updateChatItems([...chatItemsRef.current, {
                    message: response,
                    uploadDoc: null,
                    type: 'complex',
                    isBot: true,
                    ts: getCurrentTs()
                }]);
                break;
            default:
                break;
        }
    }
    const createNewChat = () => {
        updateSelectedTopic(null);
        updateChatItems([]);
        updateSearchText("");
    }
    useEffect(() => {
        if (selectedTopic != null) {
        //   updateChatItems(getChatItemsWithTopicId(selectedTopic));
        }
    }, [selectedTopic]);

    const getChatItemsWithTopicId = (topicId) => {
        const chatHistoryFromStorage = getChatHistoryFromStorage();
        if (chatHistoryFromStorage && chatHistoryFromStorage.length > 0) {
            for(let i = 0; i < chatHistoryFromStorage.length; i++) {
                for(let j = 0; j < chatHistoryFromStorage[i].topics.length; j++) {
                    if(chatHistoryFromStorage[i].topics[j].topicId === topicId) {
                        return chatHistoryFromStorage[i].topics[j].chatItems;
                    }
                }
            }
        }
        return [];
    }

    useEffect(() => {
        saveTopic(chatItems);
    }, [chatItems]);

    console.log("chatItems", chatItems);
    console.log("SelectedTopic", selectedTopic);
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
                <Chat
                    chatItems={chatItems}
                    botToRespond={botToRespond}
                />
            </div>
            <div id="chat-footer">
                <ChatInput
                    searchText={searchText}
                    updateSearchText={updateSearchText}
                    selectedFile={selectedFile}
                    updateSelectedFile={updateSelectedFile}
                    fileUploadRef={fileUploadRef}
                    onSearch={onSearch}
                    botToRespond={botToRespond}
                />
            </div>
        </div>
    )
}

export default ChatWindow;