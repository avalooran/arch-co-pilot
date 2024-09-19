import { useState, useRef } from 'react';
import './ChatInput.css';
import { BsFillSendFill } from "react-icons/bs";
import { FaFileImage } from "react-icons/fa";

function ChatInput({ onSearch, disableTextArea }) {
    const [searchText, updateSearchText] = useState("");
    const [canAsk, updateCanAsk] = useState(false);
    const [selectedFile, updateSelectedFile] = useState(null);
    const fileUploadRef = useRef(null);
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
            if (searchText.trim() !== "") {
                updateSelectedFile(null);
                fileUploadRef.current.value = "";
                onSearch(searchText, selectedFile);
            }
            updateSearchText("");
        }
    }
    const onFileChange = (event) => {
        updateSelectedFile(event.target.files[0]);
    };
    return (
        <div className="chat-input">
            <div title={selectedFile?.name && selectedFile?.size ? `File - ${selectedFile.name} (Size - ${selectedFile.size})`: ""}>
            <input type="file" ref={fileUploadRef} onChange={onFileChange} />
                <FaFileImage
                    size={30}
                    style={{
                        ...(!(canAsk && !disableTextArea) && false && {
                            cursor: "not-allowed",
                            fill: "gray"
                        }),
                        ...(selectedFile && {
                            fill: "green"
                        })
                        
                    }}
                    onClick={() => {fileUploadRef.current.click()}}
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
