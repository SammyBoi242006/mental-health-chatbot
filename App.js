import React, { useState } from 'react';
import './App.css';
import './theme.css'; // Import the theme styles

function App() {
  const [chats, setChats] = useState([
    { id: 1, title: 'Welcome Chat', messages: [] },
  ]);
  const [activeChatId, setActiveChatId] = useState(1);
  const [userInput, setUserInput] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [tempTitle, setTempTitle] = useState('');
  const [darkMode, setDarkMode] = useState(false); // ✅ Dark mode state

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const newMessage = { text: userInput, sender: 'user' };
    const updatedChats = chats.map(chat =>
      chat.id === activeChatId
        ? { ...chat, messages: [...chat.messages, newMessage] }
        : chat
    );
    setChats(updatedChats);
    setUserInput('');

    try {
      const res = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await res.json();
      const botMessage = { text: data.response, sender: 'bot' };

      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, botMessage] }
            : chat
        )
      );
    } catch (error) {
      console.error('Error talking to OpenAI:', error);
    }
  };

  const createNewChat = () => {
    const newId = Date.now();
    const newChat = { id: newId, title: `Chat ${chats.length + 1}`, messages: [] };
    setChats([...chats, newChat]);
    setActiveChatId(newId);
  };

  const startRenaming = (id, currentTitle) => {
    setRenamingId(id);
    setTempTitle(currentTitle);
  };

  const confirmRename = () => {
    if (tempTitle.trim()) {
      setChats(
        chats.map((chat) =>
          chat.id === renamingId ? { ...chat, title: tempTitle.trim() } : chat
        )
      );
    }
    setRenamingId(null);
    setTempTitle('');
  };

  const deleteChat = (id) => {
    const updatedChats = chats.filter((chat) => chat.id !== id);
    setChats(updatedChats);

    if (id === activeChatId) {
      if (updatedChats.length > 0) {
        setActiveChatId(updatedChats[0].id);
      } else {
        const newChat = { id: Date.now(), title: 'New Chat', messages: [] };
        setChats([newChat]);
        setActiveChatId(newChat.id);
      }
    }
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      {/* Chat Window */}
      <div className="chat-window">
        <div className="messages">
          {activeChat?.messages?.length > 0 ? (
            activeChat.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${msg.sender}`}
              >
                {msg.text}
              </div>
            ))
          ) : (
            <p style={{ color: '#aaa' }}>Start chatting...</p>
          )}
        </div>

        {/* Input */}
        <div className="input-container">
          <input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        {/* Top: Logo & User */}
        <div className="top-bar">
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>🧠 MindMate</div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span title="Toggle theme" onClick={() => setDarkMode(!darkMode)} style={{ cursor: 'pointer' }}>
              {darkMode ? '🌙' : '☀️'}
            </span>
            <span title="Switch account" style={{ cursor: 'pointer' }}>👤</span>
          </div>
        </div>

        {/* Chats */}
        <div className="chat-list">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${chat.id === activeChatId ? 'active' : ''}`}
              onClick={() => setActiveChatId(chat.id)}
            >
              {renamingId === chat.id ? (
                <input
                  autoFocus
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={confirmRename}
                  onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
                  style={{ flex: 1 }}
                />
              ) : (
                <>
                  <span className="chat-title">{chat.title}</span>
                  <div className="chat-actions">
                    <span
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        startRenaming(chat.id, chat.title);
                      }}
                      title="Rename"
                    >
                      ✏️
                    </span>
                    <span
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this chat?')) {
                          deleteChat(chat.id);
                        }
                      }}
                      title="Delete"
                    >
                      🗑️
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* New Chat Button */}
        <div className="new-chat">
          <button onClick={createNewChat} style={{ width: '100%', padding: '0.5rem' }}>
            + New Chat
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
