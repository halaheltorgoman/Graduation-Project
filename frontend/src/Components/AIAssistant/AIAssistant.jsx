import React, { useState, useEffect } from "react";
import axios from "axios";
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
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem('aiAssistantSessionId') || crypto.randomUUID();
  });
  
  // State for sidebar functionality
  const [isSidebarClosed, setIsSidebarClosed] = useState(() => {
    const savedState = localStorage.getItem('aiAssistantSidebarClosed');
    return savedState ? JSON.parse(savedState) : false;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [footerHeight, setFooterHeight] = useState(80);
  
  // Chat history from database
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Save sessionId to localStorage
  useEffect(() => {
    localStorage.setItem('aiAssistantSessionId', sessionId);
  }, [sessionId]);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('aiAssistantSidebarClosed', JSON.stringify(isSidebarClosed));
  }, [isSidebarClosed]);

  // Fetch chat history from database
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/ai/chat-history', {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (response.data.success) {
          setChatHistory(response.data.chatHistory);
          // If we have messages in the chat history, set them as current messages
          if (response.data.chatHistory.length > 0) {
            const currentChat = response.data.chatHistory[0];
            setMessages(currentChat.messages || []);
            setChatActive(true);
          }
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [sessionId]); // Re-fetch when sessionId changes

  // Calculate footer height and adjust sidebar positioning
  useEffect(() => {
    const calculateFooterHeight = () => {
      const footer = document.querySelector('footer, .footer, [class*="footer"]');
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const newFooterHeight = footerRect.height + 20;
        setFooterHeight(newFooterHeight);
        
        const sidebar = document.querySelector('.chat-sidebar');
        if (sidebar && window.innerWidth > 1200) {
          sidebar.style.bottom = `${newFooterHeight}px`;
        }
      }
    };

    calculateFooterHeight();
    window.addEventListener('resize', calculateFooterHeight);
    
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
      try {
        // Ensure we have a valid date
        const date = new Date(chat.updatedAt);
        if (isNaN(date.getTime())) {
          console.warn('Invalid date found:', chat.updatedAt);
          return; // Skip this chat if date is invalid
        }

        const weekStart = new Date(date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!grouped[weekKey]) {
          grouped[weekKey] = [];
        }
        grouped[weekKey].push(chat);
      } catch (error) {
        console.error('Error processing chat date:', error);
      }
    });
    return grouped;
  };

  const adjustTextareaHeight = (element) => {
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 150)}px`;
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;
    
    if (messages.length === 0) {
      setChatActive(true);
    }
    
    // Add user message immediately
    const userMessage = {
      content: inputValue,
      role: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    const textarea = document.querySelector('.chat-textarea');
    if (textarea) {
      textarea.style.height = 'auto';
    }

    try {
      // Show loading state
      const loadingMessage = {
        content: "Thinking...",
        role: 'assistant',
        isLoading: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, loadingMessage]);

      // Make API call to backend
      const response = await axios.post('http://localhost:4000/api/ai/ask', {
        prompt: inputValue,
        sessionId: sessionId
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Remove loading message and add AI response
      const aiMessage = {
        content: response.data.response || "I apologize, but I couldn't process your request at the moment.",
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => prev.filter(msg => !msg.isLoading).concat(aiMessage));
      
      // Refresh chat history after new message
      const historyResponse = await axios.get('http://localhost:4000/api/ai/chat-history', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (historyResponse.data.success) {
        setChatHistory(historyResponse.data.chatHistory);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Remove loading message and show error
      const errorMessage = {
        content: "I apologize, but I encountered an error while processing your request. Please try again.",
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => prev.filter(msg => !msg.isLoading).concat(errorMessage));
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setChatActive(false);
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    setChatHistory([]);
  };

  const handleLoadChat = async (chat) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/ai/chat-history/${chat.sessionId}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.data.success) {
        setMessages(response.data.messages);
        setSessionId(chat.sessionId);
        setChatActive(true);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
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

  const formatMessage = (text) => {
    if (!text) return null;
    
    // Split text into paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      if (!paragraph) return null;
      
      // Check if paragraph is a bullet point list
      if (paragraph.trim().startsWith('- ')) {
        const items = paragraph.split('\n').map(item => item.trim().replace(/^- /, ''));
        return (
          <ul key={index} className="message-list">
            {items.map((item, itemIndex) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </ul>
        );
      }
      
      // Check if paragraph is a numbered list
      if (paragraph.trim().match(/^\d+\.\s/)) {
        const items = paragraph.split('\n').map(item => item.trim().replace(/^\d+\.\s/, ''));
        return (
          <ol key={index} className="message-list">
            {items.map((item, itemIndex) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </ol>
        );
      }
      
      // Regular paragraph
      return <p key={index}>{paragraph}</p>;
    });
  };

  return (
    <div className={`ai-assistant-container ${isSidebarClosed ? 'closed-sidebar' : ''}`}>
      {/* Sidebar */}
      <div 
        className={`chat-sidebar ${isSidebarClosed ? 'closed' : ''}`}
        style={{
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
            {isLoading ? (
              <div className="loading">Loading chat history...</div>
            ) : chatHistory.length === 0 ? (
              <div className="no-chats">No chat history available</div>
            ) : (
              <div className="week-section">
                <h4 className="week-title">Current Chat</h4>
                {chatHistory.map(chat => {
                  const firstMessage = chat.messages[0] || {};
                  const messageContent = firstMessage.content || '';
                  const timestamp = new Date(chat.updatedAt);
                  
                  return (
                    <div 
                      key={chat.sessionId} 
                      className="history-item" 
                      onClick={() => handleLoadChat(chat)}
                    >
                      <h5>{messageContent.slice(0, 30) + (messageContent.length > 30 ? "..." : "")}</h5>
                      <p>{messageContent.slice(0, 60) + (messageContent.length > 60 ? "..." : "")}</p>
                      <span className="chat-time">
                        {!isNaN(timestamp.getTime()) ? 
                          timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                          'Invalid date'
                        }
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

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
                    setInputValue(prompt.text);
                    handleSendMessage();
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
                className={`message-container ${message.role}`}
              >
                {message.role === 'assistant' && (
                  <img src={aiLogo} alt="AI" className="message-ai-logo" />
                )}
                <div 
                  className={`message ${message.role}`}
                  style={{
                    backgroundColor: message.role === 'user' ? '#3E2F54' : '#c030d975'
                  }}
                >
                  <div className="message-content">
                    {message.isLoading ? (
                      <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    ) : (
                      formatMessage(message.content)
                    )}
                  </div>
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