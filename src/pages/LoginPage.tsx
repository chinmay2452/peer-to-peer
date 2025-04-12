import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from "framer-motion";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      console.log("Login successful!");
      navigate("/doubtboard", { 
        state: { 
          user: {
            name: userCredential.user.displayName || formData.email.split('@')[0],
            email: userCredential.user.email
          }
        }
      });
    } catch (error: any) {
      console.error("Login error:", error.message);
      alert("Login failed: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center items-center"><h1 className="text-2xl font-bold mb-4 text-center text-black">Welcome to the App</h1></div>
        <Card className="w-full max-w-md rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-2xl text-black font-bold mb-4 text-center">Log In</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                name="email"
                placeholder="Email"
                className="placeholder:text-gray-500 text-white"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                className="placeholder:text-gray-500 text-white"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Button type="submit" className="w-full">
                Log In
              </Button>
              <p className="text-sm text-center text-gray-600">
                Don't have an account?{" "}
                <Link to="/" className="text-blue-500 hover:underline">
                  Sign up
                </Link>
              </p>
              <p className="text-xs text-center text-gray-500 mt-2">
                <Link to="/forgot-password" className="hover:underline">
                  Forgot password?
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage; 