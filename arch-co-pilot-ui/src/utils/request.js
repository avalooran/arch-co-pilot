import { getFilePathApiUrl, getResponseForQuestionApiUrl, getTopicHistoryListApiUrl, getTopicSuggestionListApiUrl, saveTopicApiUrl } from '../constants/request';
import { getSessionId, getUserId } from './app';

export const getFilePathApi = async (payload) => {
    return await fetch(
            getFilePathApiUrl,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    userid: getUserId(),
                    sessionid: getSessionId(),
                    eventdatetime: new Date()                    
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
export const uploadFileToS3Api = async (url, payload) => {
    console.log("Payload", payload);
    return await fetch(
            url,
            {
                method: 'POST',
                headers: {
                    // 'Content-Type': 'multipart/form-data'           
                },
                body: payload
            }
        )
        .then(res => {
            if (res.ok)
                return {
                    status: true,
                    data: res,
                    errorMsg: null
                }
            else
                throw new Error(`Request failed - ${res.status}`);
        })
        .catch((err) => {
            return {
                status: false,
                data: null,
                errorMsg: err
            }
        });
}
export const getResponseForQuestionApi = async (payload) => {
    return await fetch(
            getResponseForQuestionApiUrl,
            {
                method: 'POST',
                headers: {
                    userid: getUserId(),
                    sessionid: getSessionId(),
                    eventdatetime: 'TestEventDateTime',
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
            console.log("err", err);
            return {
                status: false,
                data: null,
                errorMsg: err.message
            }
        });
}
export const getTopicHistoryListApi = async () => {
    return await fetch(
            getTopicHistoryListApiUrl,
            {
                method: 'GET',
                headers: {
                    userid: getUserId(),
                    sessionid: getSessionId(),
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
                    userid: getUserId(),
                    sessionid: getSessionId(),
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
                    userid: getUserId(),
                    sessionid: getSessionId(),
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