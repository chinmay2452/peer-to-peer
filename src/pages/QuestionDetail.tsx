import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '@/firebase';
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Textarea from '@/components/ui/textarea';
import Badge from '@/components/ui/badge';
import { ArrowLeft, ThumbsUp, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  tags: string[];
  answers: Answer[];
  bestAnswerId: string | null;
  userId: string;
  userName: string;
  createdAt: any;
  photoUrl?: string;
  videoUrl?: string;
  status: string;
}

export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!id) return;
      
      try {
        const questionDoc = await getDoc(doc(db, 'questions', id));
        if (questionDoc.exists()) {
          const data = questionDoc.data();
          setQuestion({
            id: questionDoc.id,
            title: data.title || '',
            description: data.description || '',
            tag: data.tag || '',
            tags: data.tags || [],
            answers: data.answers || [],
            bestAnswerId: data.bestAnswerId || null,
            userId: data.userId || '',
            userName: data.userName || 'Anonymous',
            createdAt: data.createdAt || null,
            photoUrl: data.photoUrl || null,
            videoUrl: data.videoUrl || null,
            status: data.status || 'open'
          });
        } else {
          console.error('Question not found');
          navigate('/doubtboard');
        }
      } catch (error) {
        console.error('Error fetching question:', error);
        navigate('/doubtboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestion();
  }, [id, navigate]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !user || !question) return;
    
    try {
      const newAnswer = {
        id: Date.now().toString(),
        text: answer,
        upvotes: 0,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        createdAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, 'questions', question.id), {
        answers: arrayUnion(newAnswer)
      });
      
      setAnswer('');
      
      // Refresh question data
      const questionDoc = await getDoc(doc(db, 'questions', question.id));
      if (questionDoc.exists()) {
        setQuestion({ id: questionDoc.id, ...questionDoc.data() } as Question);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleUpvote = async (answerId: string) => {
    if (!question || !user) return;
    
    try {
      const updatedAnswers = question.answers.map(a => 
        a.id === answerId ? { ...a, upvotes: (a.upvotes || 0) + 1 } : a
      );
      
      await updateDoc(doc(db, 'questions', question.id), {
        answers: updatedAnswers
      });
      
      setQuestion({ ...question, answers: updatedAnswers });
    } catch (error) {
      console.error('Error upvoting answer:', error);
    }
  };

  const handleMarkBest = async (answerId: string) => {
    if (!question || !user || user.uid !== question.userId) return;
    
    try {
      await updateDoc(doc(db, 'questions', question.id), {
        bestAnswerId: answerId
      });
      
      setQuestion({ ...question, bestAnswerId: answerId });
    } catch (error) {
      console.error('Error marking best answer:', error);
    }
  };

  if (loading || !question) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/doubtboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Questions
        </Button>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-black">
              {question.title}
            </h1>
            <p className="text-black mb-4 ">{question.description}</p>

            {/* Display photo if available */}
            {question.photoUrl && (
              <div className="my-4">
                <img 
                  src={question.photoUrl} 
                  alt="Question" 
                  className="max-h-96 rounded-md object-contain w-full"
                />
              </div>
            )}
            
            {/* Display video if available */}
            {question.videoUrl && (
              <div className="my-4">
                <video 
                  src={question.videoUrl} 
                  controls 
                  className="w-full max-h-96 rounded-md"
                />
              </div>
            )}

            <div className="flex items-center gap-2 mb-4">
              {question.tags && question.tags.length > 0 ? (
                question.tags.map((tag, index) => (
                  <Badge key={index}>{tag}</Badge>
                ))
              ) : question.tag ? (
                <Badge>{question.tag}</Badge>
              ) : null}
            </div>

            <div className="text-sm text-gray-500">
              Posted by {question.userName} on{" "}
              {question.createdAt
                ? new Date(
                    question.createdAt.seconds * 1000
                  ).toLocaleDateString()
                : "Unknown date"}
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold mb-4">
          {question.answers.length}{" "}
          {question.answers.length === 1 ? "Answer" : "Answers"}
        </h2>

        <div className="space-y-6 mb-8">
          {question.answers.map((answer) => (
            <Card
              key={answer.id}
              className={`${
                question.bestAnswerId === answer.id
                  ? "border-green-500 bg-green-50"
                  : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-700 mb-4">{answer.text}</p>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <span>Answered by {answer.userName}</span>
                      <span>•</span>
                      <span>
                        {answer.createdAt
                          ? new Date(
                              answer.createdAt.seconds * 1000
                            ).toLocaleDateString()
                          : "Unknown date"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpvote(answer.id)}
                        className="flex items-center gap-1"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{answer.upvotes || 0}</span>
                      </Button>

                      {user && user.uid === question.userId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkBest(answer.id)}
                          className={`flex items-center gap-1 ${
                            question.bestAnswerId === answer.id
                              ? "text-green-600"
                              : ""
                          }`}
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>
                            {question.bestAnswerId === answer.id
                              ? "Best Answer"
                              : "Mark as Best"}
                          </span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {user && null}
      </div>
    </div>
  );
} 