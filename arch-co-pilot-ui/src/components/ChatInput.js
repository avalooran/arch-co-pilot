import { useState } from 'react';
import './ChatInput.css';

function ChatInput({onSearch}) {
    const [searchText, updateSearchText] = useState("");
    const [canAsk, updateCanAsk] = useState(false);
    const onKeyDown = (e) => {
        if(e.key == "Enter")
            onAsk();
    }
    const onSearchTextChange = (e) => {
        const input = e.target.value;
        updateCanAsk(input.trim() != "");
        updateSearchText(input);
    }
    const onAsk = () => {
        updateSearchText("");
        onSearch(searchText);
    }
    return (
        <div className="chat-input">
            <textarea value={searchText} onChange={onSearchTextChange} onKeyDown={onKeyDown}/>       
            <button className={canAsk ? "active": ""} onClick={onAsk}>Ask &#x2191;</button>
        </div>
    );
}

export default ChatInput;
