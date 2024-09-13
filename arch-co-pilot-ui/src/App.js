import './App.css';
import { useState, useRef } from 'react';
import Header from './components/Header';
import Chat from './components/Chat';
import ChatInput from './components/ChatInput';
import { chatItemsMock } from './constants/mock';

function App() {
  const [chatItems, updateChatItems] = useState(chatItemsMock);
  const chatItemsRef = useRef(chatItems);
  chatItemsRef.current = chatItems;
  const onSearch = (searchText) => {
    const searchedInput = searchText.trim();
    updateChatItems([...chatItemsRef.current, {
      message: searchedInput,
      isBot: false
    }]); 
    insertBotsResponse("The substring() method of String values returns the part of this string from the start index up to and excluding the end index, or to the end of the string if no end index is supplied.");
  }  
  const insertBotsResponse = (responseMsg) => {
    setTimeout(() => {
      updateChatItems([...chatItemsRef.current, {
        message: "",
        isBot: true
      }]);        
    }, 10);
    for(let i=0; i < responseMsg.length; i++) {      
      const answr = responseMsg.charAt(i);
      setTimeout(() => {
         updateChatItems(chatItemsRef.current.map((x, ind) => {
            if(ind == chatItemsRef.current.length - 1)
              return { message: responseMsg.substring(0, i + 1), isBot: true }
            else 
              return x;
        }));
      },1000 + (i * 2));
    }    
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
