import './ChatInput.css';
import { BsFillSendFill } from "react-icons/bs";
import { FaFileImage } from "react-icons/fa";

function ChatInput({
    searchText,
    updateSearchText,
    selectedFile,
    updateSelectedFile,
    fileUploadRef,
    onSearch,
    botToRespond
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
            onSearch(searchText, selectedFile);
            resetInputs();
        }
    }
    const resetInputs = () => {
        updateSearchText("");
        updateSelectedFile(null);
        fileUploadRef.current.value = "";
    }

    return (
        <div className="chat-input">
            <div title={selectedFile?.name && selectedFile?.size ? `File - ${selectedFile.name} (Size - ${selectedFile.size})` : ""}>
                <input 
                    type="file" 
                    ref={fileUploadRef} 
                    onChange={onFileChange} 
                />
                <FaFileImage
                    size={30}
                    style={{
                        ...(selectedFile && {
                            fill: "green"
                        })

                    }}
                    onClick={() => fileUploadRef?.current?.click()}
                />
            </div>
            <textarea 
                value={searchText} 
                onChange={onSearchTextChange} 
                onKeyDown={onKeyDown} 
            />
            <div>
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
