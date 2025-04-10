import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, BellRing, PlusCircle, LogIn, MessageSquare } from 'lucide-react';
import { UserAvatar, UserAvatarFallback, UserAvatarImage } from '@/components/ui/user-avatar';
import { Input } from '@/components/ui/input';
import { db, auth } from '@/firebase';
import { collection, query, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Card, CardContent } from '@/components/ui/card';
import Badge from '@/components/ui/badge';

interface Question {
  id: string;
  title: string;
  description: string;
  tag: string;
  answers: any[];
  bestAnswerId: string | null;
  userId: string;
  userName: string;
  createdAt: any;
}

export default function Doubtboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userInitials, setUserInitials] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserName(user.displayName || 'Anonymous');
        setUserInitials((user.displayName || 'A').split(' ').map(n => n[0]).join('').toUpperCase());
      } else {
        setIsLoggedIn(false);
        setUserName("");
        setUserInitials("");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Check if we're returning from login page
    if (location.state?.user) {
      const user = location.state.user;
      setIsLoggedIn(true);
      setUserName(user.name);
      setUserInitials(user.name.split(' ').map(n => n[0]).join('').toUpperCase());
    }
  }, [location]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsQuery = query(
          collection(db, 'questions'),
          orderBy('createdAt', 'desc')
        );
        
        const unsubscribe = onSnapshot(questionsQuery, (snapshot) => {
          const questionsData: Question[] = [];
          snapshot.forEach((doc) => {
            questionsData.push({ id: doc.id, ...doc.data() } as Question);
          });
          setQuestions(questionsData);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };
    
    fetchQuestions();
  }, []);

  const filteredQuestions = questions.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAskQuestion = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/ask');
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex justify-between items-center px-6 py-3 bg-white shadow-md w-full">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex gap-6 md:gap-10">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-800 text-transparent bg-clip-text">
                DoubtToDiscuss
              </span>
            </Link>
            <nav className="hidden gap-6 md:flex">
              <Link to="/questions" className="flex items-center text-lg font-medium text-black transition-colors hover:text-foreground">
                Questions
              </Link>
              <Link to="/tags" className="flex items-center text-lg font-medium text-black transition-colors hover:text-foreground">
                Tags
              </Link>
              <Link to="/users" className="flex items-center text-lg font-medium text-black transition-colors hover:text-foreground">
                Users
              </Link>
            </nav>
          </div>
          
          <div className="hidden md:flex w-full max-w-sm items-center mx-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search questions..." 
                className="pl-8 rounded-full bg-muted"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Button variant="ghost" className="text-muted-foreground">
                  <BellRing className="h-5 w-5" />
                </Button>
                <Button variant="ghost" asChild className="text-brand-purple">
                  <Link to="/ask">
                    <PlusCircle className="h-5 w-5" />
                  </Link>
                </Button>
                <UserAvatar className="h-8 w-8">
                  <UserAvatarImage src="" alt={userName} />
                  <UserAvatarFallback className="bg-black">
                    {userInitials}
                  </UserAvatarFallback>
                </UserAvatar>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-black">Recent Questions</h1>
          <Button onClick={handleAskQuestion} className="bg-purple-600 hover:bg-purple-700 text-white">
            Ask a Question
          </Button>
        </div>

        <div className="grid gap-6">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((question) => (
              <Card key={question.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold mb-2 text-black">{question.title}</h2>
                      <p className="text-gray-600 mb-4 line-clamp-2">{question.description}</p>
                      <div className="flex items-center gap-2 mb-4">
                        {question.tag && <Badge>{question.tag}</Badge>}
                        <span className="text-sm text-gray-500">
                          {question.answers.length} {question.answers.length === 1 ? 'answer' : 'answers'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Posted by {question.userName}</span>
                        <span>•</span>
                        <span>{question.createdAt ? new Date(question.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date'}</span>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/question/${question.id}`}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or ask a new question</p>
              <Button onClick={handleAskQuestion} className="bg-purple-600 hover:bg-purple-700 text-white">
                Ask a Question
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
