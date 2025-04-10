// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import './App.css';
import SignupPage from "./pages/Signuppage";
import LoginPage from "./pages/LoginPage";
import Doubtboard from "./pages/doubtboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/doubtboard" element={<Doubtboard />} />
    </Routes>
  );
}

export default App;