import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import Badge from '@/components/ui/badge';
import { db, auth } from '@/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

interface Answer {
  id: string;
  text: string;
  upvotes?: number;
  userId: string;
  userName: string;
  createdAt: any;
}

interface Question {
  id: string;
  title: string;
  description: string;
  tag: string;
  answers: Answer[];
  bestAnswerId: string | null;
  userId: string;
  userName: string;
  createdAt: any;
}

export default function AskPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tag, setTag] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchQuestions();
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchQuestions = async () => {
    try {
      const questionsQuery = query(collection(db, 'questions'));
      const querySnapshot = await getDocs(questionsQuery);
      const questionsData: Question[] = [];
      
      querySnapshot.forEach((doc) => {
        questionsData.push({ id: doc.id, ...doc.data() } as Question);
      });
      
      setQuestions(questionsData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleAskQuestion = async () => {
    if (!title || !description || !user) return;
    
    try {
      const newQuestion = {
        title,
        description,
        tag,
        answers: [],
        bestAnswerId: null,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'questions'), newQuestion);
      
      setTitle('');
      setDescription('');
      setTag('');
      
      fetchQuestions();
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const handleUpvote = async (qid: string, aid: string) => {
    try {
      const question = questions.find(q => q.id === qid);
      if (!question) return;
      
      const updatedAnswers = question.answers.map(a => 
        a.id === aid ? { ...a, upvotes: (a.upvotes || 0) + 1 } : a
      );
      
      await updateDoc(doc(db, 'questions', qid), {
        answers: updatedAnswers
      });
      
      fetchQuestions();
    } catch (error) {
      console.error('Error upvoting answer:', error);
    }
  };

  const handleMarkBest = async (qid: string, aid: string) => {
    try {
      await updateDoc(doc(db, 'questions', qid), {
        bestAnswerId: aid
      });
      
      fetchQuestions();
    } catch (error) {
      console.error('Error marking best answer:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg">
          <CardContent className="space-y-4 p-6">
            <h2 className="text-2xl font-bold text-gray-900">Ask a Question</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <Input
                  id="title"
                  placeholder="What's your question? Be specific."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Provide more context about your question..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[150px]"
                />
              </div>
              <div>
                <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <Input
                  id="tag"
                  placeholder="Add tags (e.g., JavaScript, React, Algebra)"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button 
                onClick={handleAskQuestion}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Post Question
              </Button>
            </div>
          </CardContent>
        </Card>

        {questions.map((q) => (
          <Card key={q.id} className="border border-muted mt-4">
            <CardContent className="space-y-2 p-4">
              <h3 className="text-lg font-bold text-black">{q.title}</h3>
              <p className='text-black'>{q.description}</p>
              {q.tag && <Badge>{q.tag}</Badge>}
              <div className="text-sm text-gray-500">
                Posted by {q.userName} on {q.createdAt ? new Date(q.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date'}
              </div>

              <div className="mt-2 space-y-2">
                {q.answers.map((a) => (
                  <div
                    key={a.id}
                    className={`border p-2 rounded-md ${
                      q.bestAnswerId === a.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <p>{a.text}</p>
                    <div className="text-sm text-gray-500">
                      Answered by {a.userName} on {a.createdAt ? new Date(a.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date'}
                    </div>
                    <div className="flex gap-4 text-sm mt-1">
                      <Button 
                        onClick={() => handleUpvote(q.id, a.id)} 
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-black"
                      >
                        Upvote ({a.upvotes || 0})
                      </Button>
                      {user && user.uid === q.userId && (
                        <Button 
                          onClick={() => handleMarkBest(q.id, a.id)} 
                          size="sm" 
                          variant="outline"
                        >
                          Mark as Best
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}