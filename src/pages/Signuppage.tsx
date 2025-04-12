import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from "framer-motion";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [userType, setUserType] = useState<"peer" | "mentor">("peer");
  const [expertise, setExpertise] = useState("");
  const [bio, setBio] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
  
      await updateProfile(userCredential.user, {
        displayName: formData.name,
      });
  
      // Create user profile in Firestore
      if (userType === "mentor") {
        await setDoc(doc(db, 'mentors', userCredential.user.uid), {
          name: formData.name,
          email: formData.email,
          expertise: expertise.split(',').map(tag => tag.trim()),
          bio,
          createdAt: new Date(),
          role: 'mentor',
          status: 'active'
        });
      } else {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: formData.name,
          email: formData.email,
          createdAt: new Date(),
          role: 'peer'
        });
      }
  
      console.log("User signed up:", userCredential.user);
      alert("Account created successfully!");
      
      // Redirect based on user type
      if (userType === "mentor") {
        navigate("/mentor/login");
      } else {
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Signup error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Join our community and start learning or teaching
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="peer" className="w-full" onValueChange={(value: string) => setUserType(value as "peer" | "mentor")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="peer">Peer</TabsTrigger>
              <TabsTrigger value="mentor">Mentor</TabsTrigger>
            </TabsList>
            
            <TabsContent value="peer">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 text-white"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 text-white"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="mt-1 text-white"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="mt-1 text-white"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Sign Up as Peer
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="mentor">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 text-white"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 text-white"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="mt-1 text-white"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="mt-1 text-white"
                  />
                </div>
                <div>
                  <label htmlFor="expertise" className="block text-sm font-medium text-gray-700">Areas of Expertise (comma-separated)</label>
                  <Input
                    id="expertise"
                    type="text"
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    placeholder="e.g., JavaScript, React, Node.js"
                    required
                    className="mt-1 text-white"
                  />
                </div>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Professional Bio</label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about your experience and expertise"
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-white"
                    rows={4}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Sign Up as Mentor
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center text-sm">
            Already have an account(peer)?{' '}
            <Link to="/login" className="text-purple-600 hover:text-purple-700">
              Log in
            </Link>
          </div>
          <div className="mt-6 text-center text-sm">
            Already have an account(mentor)?{' '}
            <Link to="/mentor/login" className="text-purple-600 hover:text-purple-700">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;