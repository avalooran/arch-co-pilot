const validity = 60 * 60 * 24;

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
        chat_session_id: crypto.randomUUID(),
        user_id: type
    };
    setChatSession(chat_session);
}

export const getSessionId = () => {
    if(isSessionValid()) {
        const { chat_session_id } = getChatSession();
        return chat_session_id;
    }
    return null;
}
export const getUserId = () => {
    if(isSessionValid()) {
        const { user_id } = getChatSession();
        return user_id;
    }
    return null;
}

export const destroySession = () => {
    localStorage.removeItem("chat_session");
}
export const getChatSession = () => {
    return JSON.parse(atob(localStorage.getItem("chat_session")));
}
export const setChatSession = (obj) => {
    localStorage.setItem("chat_session", btoa(JSON.stringify(obj)));
}