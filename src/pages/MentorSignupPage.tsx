import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Label from '@/components/ui/label';
import Textarea from '@/components/ui/textarea';

export default function MentorSignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [expertise, setExpertise] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, {
        displayName: name
      });

      // Create mentor profile in Firestore
      await setDoc(doc(db, 'mentors', user.uid), {
        name,
        email,
        expertise: expertise.split(',').map(tag => tag.trim()),
        bio,
        createdAt: new Date(),
        role: 'mentor',
        status: 'active'
      });

      navigate('/mentor/dashboard');
    } catch (error: any) {
      console.error('Error during signup:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Mentor Sign Up</CardTitle>
          <CardDescription className="text-center">
            Join our community of experts and help peers learn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 text-white"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 text-white"
              />
            </div>
            <div>
              <Label htmlFor="expertise">Areas of Expertise (comma-separated)</Label>
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
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about your experience and expertise"
                required
                className="mt-1 text-white"
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link to="/mentor/login" className="text-purple-600 hover:text-purple-700">
                Log in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 