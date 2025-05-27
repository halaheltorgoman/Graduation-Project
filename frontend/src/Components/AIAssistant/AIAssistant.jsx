import React, { useState, useEffect } from "react";
import "./AIAssistant.css";
import aiLogo from "../../assets/images/aiassistant.png";
import refreshIcon from "../../assets/images/Refresh.png";
import budgetIcon from "../../assets/images/Stack of Money.png";
import compatibilityIcon from "../../assets/images/Merge.png";
import futureIcon from "../../assets/images/Future.png";
import socketIcon from "../../assets/images/ABC.png";
import sendIcon from "../../assets/images/send.png";
import searchIcon from "../../assets/images/search.png";
import menuIcon from "../../assets/images/menu.png";
import closeIcon from "../../assets/images/close.png";

function AIAssistant() {
  // State for chat functionality
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [chatActive, setChatActive] = useState(false);
  
  // State for sidebar functionality
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isSidebarClosed, setIsSidebarClosed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [footerHeight, setFooterHeight] = useState(80); // Default footer height
  
  // Mock chat history data
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      title: "Gaming PC Build",
      preview: "Looking for components under $1000...",
      date: new Date(Date.now() - 86400000),
    },
    {
      id: 2,
      title: "Component Compatibility",
      preview: "Will this CPU work with my motherboard...",
      date: new Date(Date.now() - 86400000 * 3),
    },
    {
      id: 3,
      title: "Workstation Advice",
      preview: "Need recommendations for video editing...",
      date: new Date(Date.now() - 86400000 * 8),
    }
  ]);

  // Calculate footer height and adjust sidebar positioning
  useEffect(() => {
    const calculateFooterHeight = () => {
      const footer = document.querySelector('footer, .footer, [class*="footer"]');
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const newFooterHeight = footerRect.height + 20; // Add some margin
        setFooterHeight(newFooterHeight);
        
        // Apply dynamic bottom positioning to sidebar
        const sidebar = document.querySelector('.chat-sidebar');
        if (sidebar && window.innerWidth > 1200) {
          sidebar.style.bottom = `${newFooterHeight}px`;
        }
      }
    };

    // Calculate on mount
    calculateFooterHeight();

    // Recalculate on window resize
    window.addEventListener('resize', calculateFooterHeight);
    
    // Use ResizeObserver if available for better footer height detection
    if (window.ResizeObserver) {
      const footer = document.querySelector('footer, .footer, [class*="footer"]');
      if (footer) {
        const resizeObserver = new ResizeObserver(calculateFooterHeight);
        resizeObserver.observe(footer);
        
        return () => {
          resizeObserver.disconnect();
          window.removeEventListener('resize', calculateFooterHeight);
        };
      }
    }

    return () => {
      window.removeEventListener('resize', calculateFooterHeight);
    };
  }, []);

  // Group chats by week
  const groupChatsByWeek = () => {
    const grouped = {};
    chatHistory.forEach(chat => {
      const weekStart = new Date(chat.date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!grouped[weekKey]) {
        grouped[weekKey] = [];
      }
      grouped[weekKey].push(chat);
    });
    return grouped;
  };

  const adjustTextareaHeight = (element) => {
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 150)}px`;
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    
    if (messages.length === 0) {
      setChatActive(true);
    }
    
    setMessages(prev => [...prev, {
      text: inputValue,
      sender: 'user'
    }]);
    
    setInputValue("");
    const textarea = document.querySelector('.chat-textarea');
    if (textarea) {
      textarea.style.height = 'auto';
    }

    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: "This is a sample response from the AI assistant. In a real implementation, this would connect to your AI backend.",
        sender: 'ai'
      }]);
      
      if (isLoggedIn) {
        setChatHistory(prev => [{
          id: Date.now(),
          title: inputValue.slice(0, 30) + (inputValue.length > 30 ? "..." : ""),
          preview: inputValue.slice(0, 60) + (inputValue.length > 60 ? "..." : ""),
          date: new Date()
        }, ...prev]);
      }
    }, 1000);
  };

  const handleNewChat = () => {
    setMessages([]);
    setChatActive(false);
  };

  const groupedChats = groupChatsByWeek();

  const promptSuggestions = [
    {
      text: "Can you suggest a build based on this budget?",
      icon: budgetIcon
    },
    {
      text: "Check compatibility for these components",
      icon: compatibilityIcon
    },
    {
      text: "What are tips for future proofing my build?",
      icon: futureIcon
    },
    {
      text: "What does a socket in CPU mean?",
      icon: socketIcon
    }
  ];

  return (
    <div className={`ai-assistant-container ${isLoggedIn ? 'with-sidebar' : ''} ${isSidebarClosed ? 'closed-sidebar' : ''}`}>
      {/* Sidebar - only shown when logged in */}
      {isLoggedIn && (
        <div 
          className={`chat-sidebar ${isSidebarClosed ? 'closed' : ''}`}
          style={{
            // Apply dynamic bottom positioning only on desktop
            ...(window.innerWidth > 1200 && {
              bottom: `${footerHeight}px`,
              maxHeight: `calc(100vh - 130px - ${footerHeight}px)`
            })
          }}
        >
          <div className="sidebar-header">
            <button 
              className="sidebar-toggle"
              onClick={() => setIsSidebarClosed(!isSidebarClosed)}
              aria-label={isSidebarClosed ? "Open sidebar" : "Close sidebar"}
            >
              <img 
                src={isSidebarClosed ? menuIcon : closeIcon} 
                alt={isSidebarClosed ? "Open sidebar" : "Close sidebar"} 
              />
            </button>
            
            {!isSidebarClosed && (
              <>
                <div className="sidebar-search">
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <img src={searchIcon} alt="Search" className="search-icon" />
                </div>
                <h3 className="sidebar-title">Chat History</h3>
              </>
            )}
          </div>

          {!isSidebarClosed && (
            <div className="history-list">
              {Object.entries(groupedChats).map(([weekStart, chats]) => (
                <div key={weekStart} className="week-section">
                  <h4 className="week-title">
                    {new Date(weekStart).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })} - {new Date(new Date(weekStart).getTime() + 6 * 86400000).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </h4>
                  {chats
                    .filter(chat => 
                      searchQuery === '' || 
                      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(chat => (
                    <div key={chat.id} className="history-item" onClick={() => {
                      setMessages([
                        { text: chat.title, sender: 'user' },
                        { text: "This would load the actual conversation history in a real implementation", sender: 'ai' }
                      ]);
                      setChatActive(true);
                    }}>
                      <h5>{chat.title}</h5>
                      <p>{chat.preview}</p>
                      <span className="chat-time">
                        {chat.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="ai-main-content">
        {/* Greeting Section - shown when chat is inactive */}
        {!chatActive && (
          <>
            <div className="ai-header">
              <img src={aiLogo} alt="AI Assistant" className="aiassistant-logo" />
            </div>
            <div className="ai-greeting">
              <h1>Hi there, User</h1>
              <h2>What Would You Like to Know?</h2>
              <p>Use one of the Prompts <br />Or Chat with AI Assistant directly</p>
            </div>

            <div className="prompt-suggestions">
              {promptSuggestions.map((prompt, index) => (
                <div 
                  key={index} 
                  className="prompt-card"
                  onClick={() => {
                    setMessages([{ text: prompt.text, sender: 'user' }]);
                    setChatActive(true);
                    setTimeout(() => {
                      setMessages(prev => [...prev, {
                        text: "This is a sample response to the prompt. In a real implementation, the AI would provide a detailed answer.",
                        sender: 'ai'
                      }]);
                    }, 1000);
                  }}
                >
                  <p>{prompt.text}</p>
                  <img src={prompt.icon} alt="" className="prompt-icon" />
                </div>
              ))}
            </div>

            <div className="refresh-prompts">
              <img src={refreshIcon} alt="Refresh" />
              <span>Refresh Prompts</span>
            </div>
          </>
        )}

        {/* Chat Container */}
        <div className={`chat-container ${chatActive ? 'active' : ''}`}>
          {chatActive && (
            <button className="new-chat-button" onClick={handleNewChat}>
              Start New Chat
            </button>
          )}
          
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message-container ${message.sender}`}
              >
                {message.sender === 'ai' && (
                  <img src={aiLogo} alt="AI" className="message-ai-logo" />
                )}
                <div 
                  className={`message ${message.sender}`}
                  style={{
                    backgroundColor: message.sender === 'user' ? '#3E2F54' : '#c030d975'
                  }}
                >
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="chat-input">
            <div className="input-container">
              <textarea
                rows="1"
                placeholder="Ask Techie"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  adjustTextareaHeight(e.target);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="chat-textarea"
              />
              <button onClick={handleSendMessage}>
                <img src={sendIcon} alt="Send" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;