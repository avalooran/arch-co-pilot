import { useEffect, useRef, useState } from 'react';
import { RiChatNewLine } from "react-icons/ri";
import { FaArrowsUpToLine, FaArrowsDownToLine } from "react-icons/fa6";
import { CiStar } from "react-icons/ci";
import './ChatWindow.css';
import ChatInput from './ChatInput';
import Chat from './Chat';
import { getFilePathApi, getResponseForQuestionApi, uploadFileToS3Api } from '../utils/request';
import { buildS3GetUrl, getCurrentTs } from '../utils/common';
import { FAVORITE_TOPIC, MAX_RETRY_ATTEMPTS, RETRY_INTERVAL } from '../constants/app';

function ChatWindow({
    isSubHeaderOpen,
    toggleSubHeaderOpen,
    chatItems,
    selectedQuestion,
    triggerUpdateChatItems,
    addToFav,
    botToRespond,
    updateBotToRespond
}) {
    const [searchText, updateSearchText] = useState("");
    const [selectedFile, updateSelectedFile] = useState(null);

    const retryAttemptCount = useRef(0);
    const fileUploadRef = useRef(null);
    const chatItemsRef = useRef();
    chatItemsRef.current = chatItems;

    const onSearch = (uploadedFile) => {
        retryAttemptCount.current = 0;
        const searchedInput = searchText.trim();
        const chatItemToBeUpdated = {
            message: searchedInput,
            uploadDoc: uploadedFile && { name: uploadedFile.name, size: uploadedFile.size },
            type: 'simple',
            isBot: false,
            ts: getCurrentTs()
        };
        triggerUpdateChatItems([...chatItemsRef.current, chatItemToBeUpdated]);
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
        else {
            if(apiResponse.errorMsg.includes('504') && retryAttemptCount.current < MAX_RETRY_ATTEMPTS) {
                retryAttemptCount.current++;
                setTimeout(() => {
                    triggerResponse(userQuestion, addHocDocumentPath);
                }, RETRY_INTERVAL);
            }
            else {
                handleBotError(apiResponse.errorMsg && apiResponse.errorMsg.includes('504') ? "Oops Request timed out. Please try again": null);
            }
        }
    }
    const handleBotError = (msg) => {
        insertBotResponse("simple", msg ? msg : `Oops Something went wrong.`);
    }
    const insertBotResponse = (type, response) => {
        switch (type) {
            case "simple":
                setTimeout(() => {
                    triggerUpdateChatItems([...chatItemsRef.current, {
                        message: "...",
                        uploadDoc: null,
                        type: 'simple',
                        isBot: true,
                        ts: getCurrentTs()
                    }]);
                }, 0);
                for (let i = 0; i < response.length; i++) {
                    setTimeout(() => {
                        triggerUpdateChatItems(chatItemsRef.current.map((x, ind) => {
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
                triggerUpdateChatItems([...chatItemsRef.current, {
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
    const clearFields = (isNewChat) => {
        updateSearchText("");
        isNewChat && triggerUpdateChatItems([]);
        updateSelectedFile(null);
        fileUploadRef.current.value = "";
    }
    useEffect(() => {
        if(selectedQuestion === null) {
            updateSearchText("");
        }
        else {
            clearFields(true);
            updateSearchText(selectedQuestion);
        }
    }, [selectedQuestion])
    return (
        <div id="chatwindow-wrapper">
            <div id="chat-header">
                {isSubHeaderOpen ?
                    <div id="slide-icon" title="Slide above">
                        <FaArrowsUpToLine
                            size={25}
                            color={"black"}
                            onClick={toggleSubHeaderOpen}
                        />
                    </div>
                    :
                    <div id="slide-icon" title="Slide below">
                        <FaArrowsDownToLine
                            size={25}
                            color={"black"}
                            onClick={toggleSubHeaderOpen}
                        />
                    </div>
                }
                
                <div id="new-chat-icon" title="Create New Chat">
                    <RiChatNewLine
                        size={25}
                        color={"black"}
                        onClick={() => !botToRespond && clearFields(true)}
                    />
                </div>

                <div id="fav-icon" title="Add topic to favorites">
                    <CiStar
                        size={30}
                        color={"black"}
                        onClick={() => addToFav(FAVORITE_TOPIC)}
                    />
                </div>
                
            </div>
            <div id="chat-body">
                <Chat
                    chatItems={chatItems}
                    botToRespond={botToRespond}
                    addToFav={addToFav}
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
                    clearFields={clearFields}
                />
            </div>
        </div>
    )
}

export default ChatWindow;