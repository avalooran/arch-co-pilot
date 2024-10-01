import { useEffect, useRef, useState } from 'react';
import './Homepage.css';
import SidePane from './components/SidePane';
import MainPane from './components/MainPane';
import { getTopicSuggestionListApi } from './utils/request';
import { topicSuggestionListMock } from './constants/mock';
import { getChatHistoryFromStorage, setChatHistoryToStorage } from './utils/app';
import { generateUUID, getCurrentDate, getPeriod } from './utils/common';

function Homepage({ logout }) {
    const [isSidePaneClose, updateIsSidePaneClose] = useState(false);
    const [topicHistoryList, updateTopicHistoryList] = useState([]);
    const [topicSuggestionList, updateTopicSuggestionList] = useState([]);
    const [selectedTopic, updateSelectedTopic] = useState(null);
    const [chatItems, updateChatItems] = useState([]);

    const selectedTopicRef = useRef();
    selectedTopicRef.current = selectedTopic;

    const topicHistoryListRef = useRef();
    topicHistoryListRef.current = topicHistoryList;

    const toggleSidePaneClose = () => updateIsSidePaneClose(!isSidePaneClose);
    const setTopicHistoryList = () => {
        const chatHistoryFromStorage = getChatHistoryFromStorage();
        if (chatHistoryFromStorage && chatHistoryFromStorage.length > 0)
            updateTopicHistoryList(chatHistoryFromStorage.map(chatHistory => {
                return {
                    ...chatHistory,
                    period: getPeriod(chatHistory.date)
                };
            }));
    }
    const setTopicSuggestionList = async () => {
        const apiResponse = await getTopicSuggestionListApi();
        if (apiResponse.status)
            updateTopicSuggestionList(apiResponse.data);
        else {
            // Once API is avaialable, remove the else condition
            updateTopicSuggestionList([...topicSuggestionListMock]);
        }
    }
    const triggerUpdateChatItems = (chatItems) => {
        if (chatItems && chatItems.length > 0) {
            const topicId = selectedTopicRef.current;
            const topicHistoryList = topicHistoryListRef.current
            if (topicId === null) {
                // If it is a new chat activation
                const newTopicObj = {
                    topicId: generateUUID(),
                    topic: chatItems[0].message,
                    chatItems
                };
                if (topicHistoryList.length > 0) {
                    updateTopicHistoryList(topicHistoryList.map(x => {
                        if (x.period === "Today")
                            x.topics = [newTopicObj, ...x.topics];
                        return x;
                    }));
                }
                else {
                    updateTopicHistoryList([
                        {
                            period: "Today",
                            date: getCurrentDate(),
                            topics: [newTopicObj]
                        }
                    ]);
                }
                updateSelectedTopic(newTopicObj.topicId);
            }
            else {
                // If it is old chat activation
                let topicHistoryToBeUpdated = [];
                if (topicHistoryList &&
                    topicHistoryList[0] &&
                    topicHistoryList[0].topics &&
                    topicHistoryList[0].topics[0] &&
                    topicHistoryList[0].topics[0].topicId === topicId
                ) {
                    //Already prioritized
                    topicHistoryToBeUpdated = [...topicHistoryList];
                    topicHistoryToBeUpdated[0].topics[0].chatItems = chatItems;
                }
                else {
                    let selectedTopicObj = null;
                    // Remove the selectedTopicObj from the topicHistory
                    topicHistoryToBeUpdated = topicHistoryList.map(x => {
                        let topics = [];
                        for (let i = 0; i < x.topics.length; i++) {
                            if (x.topics[i].topicId === topicId)
                                selectedTopicObj = {
                                    ...x.topics[i],
                                    chatItems
                                };
                            else
                                topics.push(x.topics[i]);
                        }
                        return {
                            ...x,
                            topics
                        }
                    });
                    // Add it to the first
                    if (selectedTopicObj)
                        topicHistoryToBeUpdated[0].topics = [selectedTopicObj, ...topicHistoryToBeUpdated[0].topics];
                }
                updateTopicHistoryList(topicHistoryToBeUpdated);
            }
        }
        else {
            updateSelectedTopic(null);
        }
        updateChatItems(chatItems);
    }
    const onTopicClick = (topicId) => {
        let chatItems = [];
        for (let i = 0; i < topicHistoryList.length; i++) {
            for (let j = 0; j < topicHistoryList[i].topics.length; j++) {
                if (topicHistoryList[i].topics[j].topicId === topicId)
                    chatItems = topicHistoryList[i].topics[j].chatItems;
            }
        }
        updateChatItems(chatItems);
    }
    useEffect(() => {
        setTopicHistoryList();
        setTopicSuggestionList();
    }, []);
    useEffect(() => {
        setChatHistoryToStorage(topicHistoryList);
    }, [topicHistoryList]);
    useEffect(() => {
        if (selectedTopic !== null) {
            onTopicClick(selectedTopic);
        }
    }, [selectedTopic]);

    return (
        <div id="home-page-wrapper" className="full-vh">
            <SidePane
                isSidePaneClose={isSidePaneClose}
                toggleSidePaneClose={toggleSidePaneClose}
                topicHistoryList={topicHistoryList}
                updateSelectedTopic={updateSelectedTopic}
                logout={logout}
            />
            <MainPane
                isSidePaneClose={isSidePaneClose}
                toggleSidePaneClose={toggleSidePaneClose}
                topicSuggestionList={topicSuggestionList}
                chatItems={chatItems}
                triggerUpdateChatItems={triggerUpdateChatItems}
            />
        </div>
    )
}
export default Homepage;