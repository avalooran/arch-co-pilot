import './App.css';
import { useState } from 'react';
import Header from './components/Header';
import Chat from './components/Chat';
import ChatInput from './components/ChatInput';
import { chatItemsMock } from './constants/mock';

function App() {
  const [chatItems, updateChatItems] = useState(chatItemsMock);
  const onSearch = (searchText) => {
    const searchedText = searchText.trim();
    updateChatItems([...chatItems, {
      message: searchedText,
      isBot: false
    }]);
    setTimeout(() => {

    }, 1000);
  }
  return (
    <div className="App">
      <Header />
      <Chat chatItems={chatItems} />
      <ChatInput onSearch={onSearch}/>
    </div>
  );
}

export default App;
