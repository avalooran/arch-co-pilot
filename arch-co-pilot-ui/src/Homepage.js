import { useEffect, useState } from 'react';
import './Homepage.css';
import SidePane from './components/SidePane';
import MainPane from './components/MainPane';
import { getTopicHistoryListApi, getTopicSuggestionListApi, saveTopicApi } from './utils/request';
import { topicHistoryListMock, topicSuggestionListMock } from './constants/mock';

function Homepage({ logout }) {
    const [isSidePaneClose, updateIsSidePaneClose] = useState(false);
    const [topicHistoryList, updateTopicHistoryList] = useState([]);
    const [topicSuggestionList, updateTopicSuggestionList] = useState([]);
    const [selectedTopic, updateSelectedTopic] = useState({});

    const toggleSidePaneClose = () => updateIsSidePaneClose(!isSidePaneClose);
    const setTopicHistoryList = async () => {
        const apiResponse = await getTopicHistoryListApi();
        if (apiResponse.status)
            updateTopicHistoryList(apiResponse.data);
        else {
            // Once API is avaialable, remove the else condition
            updateTopicHistoryList([...topicHistoryListMock]);
        }
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

    const saveTopic = async (chatItems) => {
        if (chatItems.length === 0)
            return null;

        const apiResponse = await saveTopicApi(chatItems);
        if (apiResponse.status)
            updateTopicHistoryList(topicHistoryList.map(x => {
                if (x.period === "Today")
                    x.topic = [{ topic: chatItems[0].message, link: "" }, [...x.topic]];
                return x;
            }));
        else {
            // Once API is avaialable, remove the else condition
            updateTopicHistoryList(topicHistoryList.map(x => {
                if (x.period === "Today")
                    x.topic = [{ topic: chatItems[0].message, link: "" }, ...x.topic];
                return x;
            }));
        }
    }

    useEffect(() => {
        setTopicHistoryList();
        setTopicSuggestionList();
    }, []);

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
                topicSuggestionList={topicSuggestionList}
                selectedTopic={selectedTopic}
                updateSelectedTopic={updateSelectedTopic}
            />
        </div>
    )
}
export default Homepage;