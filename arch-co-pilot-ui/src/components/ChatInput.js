import './ChatInput.css';
import { BsFillSendFill } from "react-icons/bs";
import { FaFileUpload } from "react-icons/fa";

function ChatInput({
    searchText,
    updateSearchText,
    selectedFile,
    updateSelectedFile,
    fileUploadRef,
    onSearch,
    botToRespond,
    clearFields
}) {
    const disableUserAction = (searchText.trim() === "" || botToRespond);

    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            triggerOnSearch();
        }
    }
    const onSearchTextChange = (e) => {
        updateSearchText(e.target.value);
    }
    const onFileChange = (event) => {
        updateSelectedFile(event.target.files[0]);
    }
    const triggerOnSearch = () => {
        if(!disableUserAction) {
            onSearch(selectedFile);
            clearFields(false);
        }
    }

    return (
        <div className="chat-input">
            <div title={selectedFile?.name && selectedFile?.size ? `File - ${selectedFile.name} (Size - ${selectedFile.size})` : ""}>
                <input 
                    type="file" 
                    ref={fileUploadRef} 
                    onChange={onFileChange} 
                />
                <div title="Upload file">
                    <FaFileUpload
                        size={30}
                        style={{
                            ...(selectedFile && {
                                fill: "green"
                            })

                        }}
                        onClick={() => fileUploadRef?.current?.click()}
                    />
                </div>
            </div>
            <textarea 
                value={searchText} 
                onChange={onSearchTextChange} 
                onKeyDown={onKeyDown} 
            />
            <div title="Send">
                <BsFillSendFill
                    size={30}
                    style={{
                        ...(disableUserAction && {
                            cursor: "not-allowed",
                            fill: "gray"
                        })
                    }}
                    onClick={triggerOnSearch}
                />
            </div>
        </div>
    );
}

export default ChatInput;
