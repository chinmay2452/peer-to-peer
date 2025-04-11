// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import './App.css';
import SignupPage from "./pages/Signuppage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import AskQuestion from "./pages/ask";
import QuestionDetail from "./pages/QuestionDetail";
import DoubtBoard from "./pages/doubtboard";
import ChatBox from "./pages/chatbox";
import Questions from "./pages/Questions";
import ChatPrototype from './pages/chatbox';

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/doubtboard" element={<DoubtBoard />} />
      <Route path="/ask" element={<AskQuestion />} />
      <Route path="/question/:id" element={<QuestionDetail />} />
      <Route path="/chat" element={<ChatBox />} />
      <Route path="/chat/:roomId" element={<ChatBox />} />
      <Route path="/questions" element={<Questions />} />
      <Route path="/chatbox" element={<ChatPrototype />} />
    </Routes>
  );
}

export default App;