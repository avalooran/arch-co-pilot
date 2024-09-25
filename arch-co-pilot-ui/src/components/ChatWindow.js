import { useEffect, useRef, useState } from 'react';
import { RiChatNewLine } from "react-icons/ri";
import { FaArrowsUpToLine } from "react-icons/fa6";
import { CiStar } from "react-icons/ci";
import './ChatWindow.css';
import ChatInput from './ChatInput';
import Chat from './Chat';
import { getFilePathApi, getResponseForQuestionApi, uploadFileToS3Api } from '../utils/request';
import { buildS3GetUrl } from '../utils/common';

function ChatWindow({ isSubHeaderOpen, toggleSubHeaderOpen, saveTopic, selectedTopic }) {
    const [searchText, updateSearchText] = useState("");
    const [selectedFile, updateSelectedFile] = useState(null);
    const [chatItems, updateChatItems] = useState([]);
    const [botToRespond, updateBotToRespond] = useState(false);

    const fileUploadRef = useRef(null);
    const chatItemsRef = useRef();
    chatItemsRef.current = chatItems;

    const onSearch = (searchText, uploadedFile) => {
        const searchedInput = searchText.trim();
        updateChatItems([...chatItemsRef.current, {
            message: searchedInput,
            uploadDoc: uploadedFile,
            type: 'simple',
            isBot: false
        }]);
        triggerApiCalls(searchedInput, uploadedFile);
    }
    const triggerApiCalls = async (searchedInput, uploadedFile) => {
        updateBotToRespond(true);
        if (uploadedFile) {
            const apiResponse = await getFilePathApi({ fileName: uploadedFile.name, fileContent: '' });
            if (apiResponse.status && apiResponse.data && apiResponse.data["url"] && apiResponse.data["url"]["url"] && apiResponse.data["url"]["fields"]) {
                const formData = new FormData();
                Object.keys(apiResponse.data["url"]["fields"]).map(key => {
                    formData.append(key, apiResponse.data["url"]["fields"][key]);
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
        switch(type) {
           case "simple":
                setTimeout(() => {
                    updateChatItems([...chatItemsRef.current, {
                        message: "...",
                        uploadDoc: null,
                        type: 'simple',
                        isBot: true
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
                                    isBot: true
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
                updateChatItems([...chatItemsRef.current, { 
                    message: response,
                    uploadDoc: null,
                    type: 'complex',
                    isBot: true
                }]);
                updateBotToRespond(false);
            break;
        }
    }
    const createNewChat = () => {
        if (chatItems.length > 0)
            saveTopic(chatItems);

        updateChatItems([]);
        updateSearchText("");
    }
    useEffect(() => {
        createNewChat();
        selectedTopic?.topic && updateSearchText(selectedTopic.topic);
    }, [selectedTopic]);

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