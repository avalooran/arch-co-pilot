import { useEffect, useState } from 'react';
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

    const saveTopic = (chatItems) => {
        if (chatItems.length === 0)
            return null;

        if (topicHistoryList && topicHistoryList.length > 0) {
            updateTopicHistoryList(topicHistoryList.map(x => {
                if (x.period === "Today")
                    x.topics = x.topics.map((y, ind) => {
                        return {
                            ...y,
                            ...(ind === 0 && { topic: chatItems[0].message, chatItems })
                        }
                    })
                return x;
            }));
        }
    }

    const prioritizeTopic = (topicId) => {
        if (topicId) {
            //Already prioritized
            if (topicHistoryList && topicHistoryList[0] && topicHistoryList[0].topics && topicHistoryList[0].topics[0] && topicHistoryList[0].topics[0].topicId === topicId)
                return;

            let selectedTopicObj = null;
            // Remove the selectedTopicObj from the topicHistory
            let topicHistoryToBeUpdated = topicHistoryList.map(x => {
                const topics = [];
                for (let i = 0; i < x.topics.length; i++) {
                    if (x.topics[i].topicId === topicId)
                        selectedTopicObj = x.topics[i];
                    else
                        topics = x.topics[i];
                }
                return {
                    ...x,
                    topics
                }
            });
            // Add it to the first
            if (selectedTopicObj)
                topicHistoryToBeUpdated[0].topics = [selectedTopicObj, ...topicHistoryToBeUpdated[0].topics];

            updateTopicHistoryList(topicHistoryToBeUpdated);
        }
        else {
            const newTopicObj = {
                topicId: generateUUID(),
                topic: "",
                chatItems: []
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
    }

    useEffect(() => {
        setTopicHistoryList();
        setTopicSuggestionList();
    }, []);

    useEffect(() => {
        setChatHistoryToStorage(topicHistoryList);
    }, [topicHistoryList]);

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
                saveTopic={saveTopic}
                prioritizeTopic={prioritizeTopic}
                topicSuggestionList={topicSuggestionList}
                selectedTopic={selectedTopic}
                updateSelectedTopic={updateSelectedTopic}
                chatItems={chatItems}
                updateChatItems={updateChatItems}
            />
        </div>
    )
}
export default Homepage;