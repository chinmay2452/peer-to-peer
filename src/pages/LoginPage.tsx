import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from "framer-motion";

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login functionality
    console.log("Login data submitted:", formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-center">Log In</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                name="email"
                placeholder="Email"
                className="placeholder:text-gray-500"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                className="placeholder:text-gray-500"
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