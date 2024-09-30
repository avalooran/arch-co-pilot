/* 1. Session utils starts here */

import { generateUUID } from "./common";

/* 1a. Common Session utils starts here */
export const setToStorage = (key, value) => {
    localStorage.setItem(key, btoa(JSON.stringify(value)));
}

export const destroyStorage = (key) => {
    localStorage.removeItem(key);
}

export const getFromStorage = (key) => {
    const value = localStorage.getItem(key);
    return value == null ? null : JSON.parse(atob(value));
}
/* 1a. Common Session utils ends here */

/* 1b. Chat Session utils starts here */

const validity = 10 * 24 * 60 * 60;

export const destroySession = () => {
    destroyStorage("chat_session");
}

export const getChatSession = () => {
    /*{
        ts: new Date().getTime(),
        chat_session_id: generateUUID(),
        user_id: type
    }*/
    return getFromStorage("chat_session");
}

export const setChatSession = (obj) => {
    setToStorage("chat_session",obj);
}

export const isSessionValid = () => {
    const chat_session = getChatSession();
    if (chat_session === null || chat_session.ts === null || chat_session.chat_session_id === null || chat_session.user_id === null)
        return false;
    const currentTs = new Date().getTime();
    if (((currentTs - chat_session.ts) / 1000) > validity || chat_session.chat_session_id.length <= 0)
        return false;

    return true;
}

export const establishSession = (type) => {
    const chat_session = {
        ts: new Date().getTime(),
        chat_session_id: generateUUID(),
        user_id: type
    };
    setChatSession(chat_session);
}

export const getSessionId = () => {
    if (isSessionValid()) {
        const { chat_session_id } = getChatSession();
        return chat_session_id;
    }
    return null;
}
export const getUserId = () => {
    if (isSessionValid()) {
        const { user_id } = getChatSession();
        return user_id;
    }
    return null;
}
/* 1b. Chat Session utils ends here */

/* 1c. Chat History utils starts here */
export const setChatHistoryToStorage = (value) => {
    setToStorage("chat_history", value)

}

export const getChatHistoryFromStorage = () => {
    /*
    [
        {
            date: "mm/dd/yyyy",
            topics: [
                {
                    topicId: "",
                    topic: "",
                    chatItem: []
                }
            ]
        }
    ] */
    return getFromStorage("chat_history"); 
}

/* 1c. Chat History utils ends here */

/* Session utils ends here */

