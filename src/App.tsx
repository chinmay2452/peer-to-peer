// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import './App.css';
import SignupPage from "./pages/Signuppage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;