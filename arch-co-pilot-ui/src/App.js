import './App.css';
import Header from './components/Header';
import Chat from './components/Chat';
import ChatInput from './components/ChatInput';

function App() {
  return (
    <div className="App">
      <Header />
      <Chat />
      <ChatInput />
    </div>
  );
}

export default App;
