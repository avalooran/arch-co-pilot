import { useEffect, useRef, useState } from 'react';
import './Homepage.css';
import SidePane from './components/SidePane';
import MainPane from './components/MainPane';
import { getChatHistoryFromStorage, getChatSuggestionsFromStorage, maxSuggestions, setChatHistoryToStorage, setChatSuggestionsToStorage } from './utils/app';
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

    const topicSuggestionListRef = useRef();
    topicSuggestionListRef.current = topicSuggestionList;

    const toggleSidePaneClose = () => updateIsSidePaneClose(!isSidePaneClose);
    const setTopicHistoryList = () => {
        const chatHistoryFromStorage = getChatHistoryFromStorage();
        if (chatHistoryFromStorage && chatHistoryFromStorage.length > 0) {
            let topicHistoryListToBeUpdated = chatHistoryFromStorage.map(chatHistory => {
                return {
                    ...chatHistory,
                    period: getPeriod(chatHistory.date)
                }
            });
            if(topicHistoryListToBeUpdated.findIndex(x => x.period === 'Today') === -1) {
                topicHistoryListToBeUpdated = [ {
                    period: "Today",
                    date: getCurrentDate(),
                    topics: []
                }, ...topicHistoryListToBeUpdated];
            }
            updateTopicHistoryList(topicHistoryListToBeUpdated);
        }
    }
    const setTopicSuggestionList = () => {
        let topicSuggestionListToBeUpdated = [...new Array(maxSuggestions)].map(x => {
            return {
                topicId: null,
                topic: "",
                chatItems: [] 
            }
        });
        const chatSuggestionsFromStorage = getChatSuggestionsFromStorage();
        if(chatSuggestionsFromStorage !== null && chatSuggestionsFromStorage.length > 0) {
            topicSuggestionListToBeUpdated = [...chatSuggestionsFromStorage, ...topicSuggestionListToBeUpdated];
            topicSuggestionListToBeUpdated.length = maxSuggestions;
        }
        updateTopicSuggestionList(topicSuggestionListToBeUpdated);
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
    const addToFav = () => {
        const topicId = selectedTopicRef.current;
        const index = topicSuggestionListRef.current.findIndex(x => x && x.topicId === topicId);
        if (topicId) {
            const topicToBeAddedToFav = index === -1 ? {
                topicId,
                topic: chatItems[0].message,
                chatItems: chatItems
            }: topicSuggestionListRef.current[index];
            const topicSuggestionListToBeUpdated = [topicToBeAddedToFav, ...topicSuggestionListRef.current.filter((_, ind) => ind !== index)];
            topicSuggestionListToBeUpdated.length = maxSuggestions;
            updateTopicSuggestionList(topicSuggestionListToBeUpdated);
        }
    }
    useEffect(() => {
        setTopicHistoryList();
        setTopicSuggestionList();
    }, []);
    useEffect(() => {
        setChatHistoryToStorage(topicHistoryList);
    }, [topicHistoryList]);
    useEffect(() => {
        topicSuggestionList.length > 0 && setChatSuggestionsToStorage(topicSuggestionList);
    }, [topicSuggestionList]);
    useEffect(() => {
        if (selectedTopic !== null) {
            onTopicClick(selectedTopic);
        }
    }, [selectedTopic]);

    console.log("topicSuggestionList", topicSuggestionList);
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
                updateSelectedTopic={updateSelectedTopic}
                addToFav={addToFav}
            />
        </div>
    )
}
export default Homepage;