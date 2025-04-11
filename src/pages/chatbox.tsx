import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { io, Socket } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

interface Message {
  sender: "student" | "mentor";
  text: string;
  timestamp: string;
  senderId?: string;
}

const LiveChatSection: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userRole = "student"; // This should come from your auth context
  const navigate = useNavigate();
  const params = useParams<{ roomId: string }>();

  // Initialize socket connection and room ID
  useEffect(() => {
    // Generate a unique room ID if not provided in URL
    const newRoomId = params.roomId || uuidv4();
    setRoomId(newRoomId);
    
    // If no room ID in URL, update the URL with the new room ID
    if (!params.roomId) {
      navigate(`/chat/${newRoomId}`, { replace: true });
    }
    
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
      
      // Set user role
      newSocket.emit("set_role", userRole);
      
      // Join the room
      newSocket.emit("join_room", newRoomId);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    // Message event handlers
    newSocket.on("receive_message", (data) => {
      const newMessage: Message = {
        sender: data.sender,
        text: data.message,
        timestamp: new Date().toLocaleTimeString(),
        senderId: data.senderId,
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    // Typing event handlers
    newSocket.on("user_typing", (data) => {
      if (data.userId !== newSocket.id) {
        setIsTyping(data.isTyping);
      }
    });

    // Cleanup on unmount
    return () => {
      newSocket.emit("leave_room", newRoomId);
      newSocket.disconnect();
    };
  }, [params.roomId, navigate, userRole]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle typing status
  const handleTyping = () => {
    if (socket && isConnected && roomId) {
      socket.emit("typing", { roomId, isTyping: true });
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", { roomId, isTyping: false });
      }, 1000);
    }
  };

  const handleSend = () => {
    if (!input.trim() || !socket || !isConnected || !roomId) return;

    const newMessage: Message = {
      sender: userRole,
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString(),
      senderId: socket.id,
    };

    // Emit message to server
    socket.emit("send_message", {
      roomId,
      message: input.trim(),
      sender: userRole,
      senderId: socket.id,
    });

    // Update local state
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit("typing", { roomId, isTyping: false });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-4 shadow-xl rounded-2xl">
      <h2 className="text-xl font-semibold mb-4 text-center">Live Chat with Mentor</h2>
      <div className="text-center mb-2">
        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
        <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
        <div className="text-xs text-gray-500 mt-1">
          Room ID: {roomId}
        </div>
      </div>
      <CardContent className="h-96 overflow-y-auto space-y-4 bg-gray-50 rounded-xl p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === "student" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`rounded-xl px-4 py-2 max-w-xs break-words shadow-sm ${
                msg.sender === "student" ? "bg-blue-100" : "bg-green-100"
              }`}
            >
              <p className="text-sm font-medium">{msg.text}</p>
              <p className="text-xs text-right text-gray-500 mt-1">{msg.timestamp}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-xl px-4 py-2 bg-gray-200">
              <p className="text-sm text-gray-500">Mentor is typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="flex gap-2 mt-4">
        <Input
          placeholder="Type your doubt..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            handleTyping();
          }}
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={!isConnected}
        />
        <Button onClick={handleSend} disabled={!isConnected}>Send</Button>
      </div>
    </Card>
  );
};

export default LiveChatSection;