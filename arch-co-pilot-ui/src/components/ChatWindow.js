import { useRef, useState } from 'react';
import { RiChatNewLine } from "react-icons/ri";
import { FaArrowsUpToLine, FaArrowsDownToLine } from "react-icons/fa6";
import { CiStar } from "react-icons/ci";
import './ChatWindow.css';
import ChatInput from './ChatInput';
import Chat from './Chat';
import { getFilePathApi, getResponseForQuestionApi, uploadFileToS3Api } from '../utils/request';
import { buildS3GetUrl, getCurrentTs } from '../utils/common';

function ChatWindow({
    isSubHeaderOpen,
    toggleSubHeaderOpen,
    chatItems,
    triggerUpdateChatItems,
    addToFav
}) {
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
            console.log("errorMsg", apiResponse.errorMsg);
            handleBotError(apiResponse.errorMsg && apiResponse.errorMsg.status == 504 ? "Request timed out. Please try again": null);
        }
    }
    const handleBotError = (msg) => {
        insertBotResponse("simple", msg ? msg : `Oops Something went wrong. Please try again.`);
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
    const createNewChat = () => {
        updateSearchText("");
        triggerUpdateChatItems([]);
    }
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
                <div id="fav-icon" title="Add to favorites">
                    <CiStar
                        size={30}
                        color={"black"}
                        onClick={addToFav}
                    />
                </div>
                <div id="new-chat-icon" title="Create New Chat">
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