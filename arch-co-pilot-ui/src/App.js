import './App.css';
import { useState, useRef } from 'react';
import Header from './components/Header';
import Chat from './components/Chat';
import ChatInput from './components/ChatInput';
import { isMockEnabled, chatItemsMock, chatResponseFromBot } from './constants/mock';
import { searchApiUrl } from './constants/request';

function App() {
  const [chatItems, updateChatItems] = useState(isMockEnabled ? chatItemsMock: []);
  const [disableTextArea, updateDisableTextArea] = useState(false);
  const chatItemsRef = useRef(chatItems);
  chatItemsRef.current = chatItems;
  const onSearch = (searchText) => {
    const searchedInput = searchText.trim();
    updateChatItems([...chatItemsRef.current, {
      message: searchedInput,
      isBot: false
    }]);
    getResponse(searchedInput);
  }
  const getResponse = (searchedInput) => {
    updateDisableTextArea(true);
    if(isMockEnabled)
      insertBotsResponse(chatResponseFromBot);
    else {
      fetch(searchApiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({"headers": {"userID": "Imp"}, "body": {"question": "Who is archi"}})
      })
      .then(res => res.json())
      .then(res => console.log(res));
    }
  }
  const insertBotsResponse = (responseMsg) => {
    setTimeout(() => {
      updateChatItems([...chatItemsRef.current, {
        message: "...",
        isBot: true
      }]);        
    }, 10);
    
    for(let i=0; i < responseMsg.length; i++) {      
      setTimeout(() => {
         updateChatItems(chatItemsRef.current.map((x, ind) => {
            if(ind == chatItemsRef.current.length - 1)
              return { message: responseMsg.substring(0, i + 1), isBot: true }
            else 
              return x;
        }));
        if(i == responseMsg.length - 1)
          updateDisableTextArea(false);
      },1000 + (i * 5));
    }    
  }
  return (
    <div className="App">
      <Header />
      <Chat chatItems={chatItems} />
      <ChatInput onSearch={onSearch} disableTextArea={disableTextArea}/>
    </div>
  );
}

export default App;
