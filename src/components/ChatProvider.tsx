import React, { useState, useEffect } from 'react';
import ChatWithBot from './ChatWithBot';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const ChatProvider: React.FC = () => {
  const [username, setUsername] = useState<string>('Guest');
  const [chatId, setChatId] = useState<string>('peer-support');
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If user is authenticated, use their display name or email as username
        setUsername(user.displayName || user.email?.split('@')[0] || 'User');
        
        // You could also set a specific chat room based on user role or other attributes
        // For example: setChatId(`${user.uid}-support`);
      } else {
        setUsername('Guest');
        setChatId('peer-support');
      }
    });
    
    return () => unsubscribe();
  }, []);

  return <ChatWithBot username={username} chatId={chatId} />;
};

export default ChatProvider; 