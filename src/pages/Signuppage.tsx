import React, { useState } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from "framer-motion";

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    // TODO: Connect to backend/Firebase Auth
    console.log("Signup data submitted:", formData);
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
            <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                name="name"
                placeholder="Full Name"
                className="placeholder:text-gray-500"
                value={formData.name}
                onChange={handleChange}
                required
              />
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
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="placeholder:text-gray-500"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <Button type="submit" className="w-full">
                Create Account
              </Button>
              <p className="text-sm text-center text-gray-600">
                Already have an account?{" "}
                <a href="/login" className="text-blue-500 hover:underline">
                  Log in
                </a>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignupPage;