import { useState } from 'react';
import './ChatInput.css';

function ChatInput() {
    const [searchText, updateSearchText] = useState("");
    const [textAreaHeight, updateTextAreaHeight] = useState(50);
    const onKeyDownFn = (e) => {
        updateSearchText(e.target.value);
        updateTextAreaHeight(e.target.scrollHeight);
      //  e.target.style.height = 'inherit';
      //  e.target.style.height = `${e.target.scrollHeight}px`; 
    }
    return (
        <div className="chat-input" style={{height: (textAreaHeight + 20) + "px"}}>
            <textArea onKeyDown={onKeyDownFn} style={{height: textAreaHeight + "px"}} value={searchText}/>       
        </div>
    );
}

export default ChatInput;
