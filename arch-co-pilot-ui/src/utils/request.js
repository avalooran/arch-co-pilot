import { getResponseForQuestionApiUrl, getTopicHistoryListApiUrl, getTopicSuggestionListApiUrl, saveTopicApiUrl } from '../constants/request';

export const getResponseForQuestionApi = async (payload) => {
    return await fetch(
            getResponseForQuestionApiUrl,
            {
                method: 'POST',
                headers: {
                    userid: 'TestUserId',
                    sessionid: 'TestSessionId',
                    eventdatetime: new Date(),
                    conversationtopic: 'TestConversationTopic',
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        )
        .then(res => {
            if (res.ok)
                return res.json();
            else
                throw new Error(`Request failed - ${res.status}`);
        })
        .then(res => {
            return {
                status: true,
                data: res,
                errorMsg: null
            }
        })
        .catch((err) => {
            return {
                status: false,
                data: null,
                errorMsg: err
            }
        });
}
export const getTopicHistoryListApi = async () => {
    return await fetch(
            getTopicHistoryListApiUrl,
            {
                method: 'GET',
                headers: {
                    userid: 'TestUserId',
                    sessionid: 'TestSessionId',
                    eventdatetime: new Date(),
                    conversationtopic: 'TestConversationTopic',
                    "Content-Type": "application/json"
                },
            }
        )
        .then(res => {
            if (res.ok)
                return res.json();
            else
                throw new Error(`Request failed - ${res.status}`);
        })
        .then(res => {
            return {
                status: true,
                data: res,
                errorMsg: null
            }
        })
        .catch((err) => {
            return {
                status: false,
                data: null,
                errorMsg: err
            }
        });
}
export const getTopicSuggestionListApi = async () => {
    return await fetch(
            getTopicSuggestionListApiUrl,
            {
                method: 'GET',
                headers: {
                    userid: 'TestUserId',
                    sessionid: 'TestSessionId',
                    eventdatetime: new Date(),
                    conversationtopic: 'TestConversationTopic',
                    "Content-Type": "application/json"
                },
            }
        )
        .then(res => {
            if (res.ok)
                return res.json();
            else
                throw new Error(`Request failed - ${res.status}`);
        })
        .then(res => {
            return {
                status: true,
                data: res,
                errorMsg: null
            }
        })
        .catch((err) => {
            return {
                status: false,
                data: null,
                errorMsg: err
            }
        });
}
export const saveTopicApi = async (payload) => {
    return await fetch(
            saveTopicApiUrl,
            {
                method: 'POST',
                headers: {
                    userid: 'TestUserId',
                    sessionid: 'TestSessionId',
                    eventdatetime: new Date(),
                    conversationtopic: 'TestConversationTopic',
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        )
        .then(res => {
            if (res.ok)
                return res.json();
            else
                throw new Error(`Request failed - ${res.status}`);
        })
        .then(res => {
            return {
                status: true,
                data: res,
                errorMsg: null
            }
        })
        .catch((err) => {
            return {
                status: false,
                data: null,
                errorMsg: err
            }
        });
}