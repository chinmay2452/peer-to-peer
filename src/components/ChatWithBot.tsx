import React, { useEffect, useState } from 'react';
import { ref, push, onValue, DataSnapshot } from 'firebase/database';
import database from '../firebase';

interface Message {
  user: string;
  text: string;
  timestamp: number;
}

interface ChatProps {
  username: string;
  chatId: string;
}

const ChatWithBot: React.FC<ChatProps> = ({ username, chatId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const chatRef = ref(database, `chats/${chatId}/messages`);

  useEffect(() => {
    if (!isOpen) return;
    
    const unsubscribe = onValue(chatRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      const loadedMessages: Message[] = data ? Object.values(data) : [];
      setMessages(loadedMessages);

      const lastMsg = loadedMessages[loadedMessages.length - 1];
      if (lastMsg?.user !== "MentorBot" && lastMsg?.user !== username) {
        respondAsMentorBot(lastMsg.text);
      }
    });

    return () => unsubscribe();
  }, [chatId, isOpen, username]);

  const respondAsMentorBot = (text: string) => {
    const lower = text.toLowerCase();
    let reply: string | null = null;

    if (lower.includes("hello") || lower.includes("hi")) {
      reply = "Hello! How can I help you today?";
    } else if (lower.includes("deadline")) {
      reply = "Deadlines are usually announced on the portal. Please check there.";
    } else if (lower.includes("help") || lower.includes("how")) {
      reply = "Feel free to ask your questions. I'm here to help!";
    } else if (lower.includes("doubt")) {
      reply = "If you have a doubt, please be specific about the topic or concept you're struggling with.";
    } else if (lower.includes("assignment")) {
      reply = "For assignment help, I recommend checking the resources section or reaching out to a specific tutor.";
    } else if (lower.includes("thank")) {
      reply = "You're welcome! Let me know if you need anything else.";
    }

    if (reply) {
      setTimeout(() => {
        const botMessage: Message = {
          user: "MentorBot",
          text: reply!,
          timestamp: Date.now(),
        };
        push(chatRef, botMessage);
      }, 1000);
    }
  };

  const sendMessage = () => {
    if (input.trim() === "") return;
    const newMsg: Message = {
      user: username,
      text: input,
      timestamp: Date.now(),
    };
    push(chatRef, newMsg);
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 w-80 h-96 bg-white shadow-lg rounded-lg flex flex-col overflow-hidden z-50">
      <div className="bg-blue-500 text-white p-3 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Chat Support</h2>
        <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="flex-grow overflow-y-auto p-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-4">
            <p>No messages yet. Start a conversation!</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-3 ${msg.user === username ? 'text-right' : 'text-left'}`}>
            <div className="text-xs text-gray-500 mb-1">{msg.user}</div>
            <div className={`inline-block px-3 py-2 rounded-lg max-w-[80%] break-words ${
              msg.user === "MentorBot" ? 'bg-blue-100' : 
              msg.user === username ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            className="flex-grow p-2 border rounded-full text-sm"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWithBot; 