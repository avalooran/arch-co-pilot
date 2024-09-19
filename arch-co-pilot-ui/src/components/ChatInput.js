import { useState } from 'react';
import './ChatInput.css';
import { BsFillSendFill } from "react-icons/bs";
import { FaFileImage } from "react-icons/fa";

function ChatInput({ onSearch, disableTextArea }) {
    const [searchText, updateSearchText] = useState("");
    const [canAsk, updateCanAsk] = useState(false);
    const onKeyDown = (e) => {
        if (e.key === "Enter" && !disableTextArea) {
            e.preventDefault();
            onAsk();
            updateSearchText("");
        }
    }
    const onSearchTextChange = (e) => {
        const input = e.target.value;
        updateCanAsk(input.trim() !== "");
        updateSearchText(input);
    }
    const onAsk = () => {
        if (!disableTextArea) {
            if (searchText.trim() !== "")
                onSearch(searchText);
            updateSearchText("");
        }
    }
    return (
        <div className="chat-input">
            <div>
                <FaFileImage
                    size={30}
                    style={{
                        ...(!(canAsk && !disableTextArea) && {
                            cursor: "not-allowed",
                            fill: "gray"
                        })
                    }}
                />
            </div>
            <textarea value={searchText} onChange={onSearchTextChange} onKeyDown={onKeyDown} />
            <div>
                <BsFillSendFill
                    size={30}
                    style={{
                        ...(!(canAsk && !disableTextArea) && {
                            cursor: "not-allowed",
                            fill: "gray"
                        })
                    }}
                    onClick={onAsk}
                />

            </div>

            {/* <button className={canAsk && !disableTextArea ? "active" : ""} disabled={!(canAsk && !disableTextArea)} onClick={onAsk}>Ask</button> */}
        </div>
    );
}

export default ChatInput;
