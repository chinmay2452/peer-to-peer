// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import './App.css';
import SignupPage from "./pages/Signuppage";
import LoginPage from "./pages/LoginPage";
import Doubtboard from "./pages/doubtboard";
import AskPage from "./pages/ask";
import QuestionDetail from "./pages/QuestionDetail.tsx";
import ChatProvider from "./components/ChatProvider";

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/doubtboard" element={<Doubtboard />} />
        <Route path="/ask" element={<AskPage />} />
        <Route path="/question/:questionId" element={<QuestionDetail />} />
      </Routes>
      <ChatProvider />
    </div>
  );
}

export default App;