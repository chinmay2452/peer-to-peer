import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MentorProfile {
  name: string;
  email: string;
  expertise: string[];
  bio: string;
  status: string;
}

const MentorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentorProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/mentor/login');
          return;
        }

        const mentorDoc = await getDoc(doc(db, 'mentors', user.uid));
        if (mentorDoc.exists()) {
          setProfile(mentorDoc.data() as MentorProfile);
        } else {
          setError('Mentor profile not found');
          navigate('/mentor/login');
        }
      } catch (error) {
        console.error('Error fetching mentor profile:', error);
        setError('Failed to load mentor profile');
      } finally {
        setLoading(false);
      }
    };

    fetchMentorProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/mentor/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/mentor/login')}
            className="mt-4"
          >
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mentor Dashboard</h1>
          <Link to="/" className="flex items-center space-x-2">
              <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-800 text-transparent bg-clip-text">
                ClassMate
              </span>
            </Link>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name}`} />
                  <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{profile?.name}</CardTitle>
                  <CardDescription>{profile?.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile?.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Bio</h3>
                  <p className="text-gray-600">{profile?.bio}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="md:col-span-2">
            <Tabs defaultValue="sessions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="sessions">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Sessions</CardTitle>
                    <CardDescription>Your scheduled mentoring sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Placeholder for sessions */}
                      <div className="text-center text-gray-500 py-8">
                        No upcoming sessions
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requests">
                <Card>
                  <CardHeader>
                    <CardTitle>Mentoring Requests</CardTitle>
                    <CardDescription>Pending requests from peers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Placeholder for requests */}
                      <div className="text-center text-gray-500 py-8">
                        No pending requests
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics</CardTitle>
                    <CardDescription>Your mentoring statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-purple-700">Total Sessions</h3>
                        <p className="text-3xl font-bold">0</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-purple-700">Active Peers</h3>
                        <p className="text-3xl font-bold">0</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-purple-700">Rating</h3>
                        <p className="text-3xl font-bold">-</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard; 