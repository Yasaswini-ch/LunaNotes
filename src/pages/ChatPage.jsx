import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../context/NotesContext';
import { chatWithNotes } from '../lib/apiClient';
import { firebaseReady, auth } from '../firebase';
import { Send } from 'lucide-react';

const ChatPage = () => {
  const { processedNotes } = useNotes();
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!processedNotes) {
      navigate('/');
    } else if (chatHistory.length === 0) {
      setChatHistory([{ sender: 'ai', text: 'Hello! Ask me anything about your notes.' }]);
    }
  }, [processedNotes, navigate, chatHistory]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    const question = userInput.trim();
    if (!question || isLoading) return;

    if (firebaseReady && !auth?.currentUser) {
      alert("Please sign in to chat with your notes.");
      return;
    }

    const newHistory = [...chatHistory, { sender: 'user', text: question }];
    setChatHistory(newHistory);
    setUserInput('');
    setIsLoading(true);

    try {
        const historyForApi = newHistory
            .filter(msg => msg.sender !== 'ai' || msg.text.startsWith('Hello!') === false)
            .map(msg => ({ 
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text 
            }));


        const result = await chatWithNotes({
          processedNotes,
          history: historyForApi.slice(0, -1).reduce((acc, msg, i) => {
            if (msg.role === 'user') {
              acc.push({ question: msg.content, answer: historyForApi[i + 1]?.content || "" });
            }
            return acc;
          }, []),
          question,
        });

        setChatHistory((prev) => [...prev, { sender: 'ai', text: result.answer }]);
    } catch (err) {
        console.error("Chat error:", err);
        setChatHistory(prev => [...prev, { sender: 'ai', text: "Sorry, I ran into an error. Please try again." }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[75vh]">
      <h1 className="text-4xl font-bold mb-4 text-center font-display">Chat with Your Notes</h1>
      
      <div className="flex-grow p-4 overflow-y-auto rounded-2xl glass-card">
        <div className="flex flex-col gap-4">
          {chatHistory.map((message, index) => (
            <div key={index} className={`chat-message ${message.sender}`}>
              <p>{message.text}</p>
            </div>
          ))}
          {isLoading && (
            <div className="chat-message ai">
              <span className="typing-indicator"></span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask a question..."
          className="flex-grow p-3 rounded-full bg-white/30 dark:bg-black/20 border border-light-accent/30 dark:border-dark-button/30 focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-button focus:outline-none backdrop-blur-md transition placeholder:text-light-heading/50 dark:placeholder:text-dark-glow/50"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !userInput.trim()}
          className="w-12 h-12 flex items-center justify-center rounded-full text-white bg-gradient-to-r from-light-accent to-light-heading dark:bg-gradient-to-r dark:from-dark-button dark:to-dark-accent dark:text-dark-bg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </div>
      <style jsx>{`
        .chat-message { @apply p-3 rounded-2xl max-w-[80%]; }
        .chat-message.ai { @apply bg-light-card dark:bg-dark-card self-start rounded-bl-none; }
        .chat-message.user { @apply bg-light-accent text-white dark:bg-dark-button dark:text-dark-bg self-end rounded-br-none; }
        .typing-indicator {
            display: inline-block;
            width: 24px;
            height: 10px;
            background: radial-gradient(circle at 3px 50%, currentColor 3px, transparent 0) 0 0,
                        radial-gradient(circle at 3px 50%, currentColor 3px, transparent 0) 9px 0,
                        radial-gradient(circle at 3px 50%, currentColor 3px, transparent 0) 18px 0;
            background-size: 6px 6px;
            background-repeat: no-repeat;
            animation: typing 1s infinite;
        }
        @keyframes typing {
            33% { background-position: 0 0, 9px 0, 18px 0; }
            66% { background-position: 0 0, 9px 0, 18px 0; }
            0%, 50%, 100% { background-position: 0 -10px, 9px 0, 18px 0; }
            16.5%, 33.5%, 82.5% { background-position: 0 0, 9px -10px, 18px 0; }
            25%, 66.5% { background-position: 0 0, 9px 0, 18px -10px; }
        }
      `}</style>
    </div>
  );
};

export default ChatPage;
