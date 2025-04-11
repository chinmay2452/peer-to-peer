import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Filter, SortDesc, SortAsc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { db, auth } from '@/firebase';
import { collection, query, getDocs, orderBy, onSnapshot, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Card, CardContent } from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Question {
  id: string;
  title: string;
  description: string;
  tag: string;
  tags: string[];
  answers: any[];
  bestAnswerId: string | null;
  userId: string;
  userName: string;
  createdAt: any;
  photoUrl?: string;
  videoUrl?: string;
  status: string;
}

export default function Questions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        let questionsQuery = query(
          collection(db, 'questions'),
          orderBy('createdAt', sortOrder)
        );
        
        const unsubscribe = onSnapshot(questionsQuery, (snapshot) => {
          const questionsData: Question[] = [];
          const tagsSet = new Set<string>();
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            questionsData.push({ id: doc.id, ...data } as Question);
            
            // Collect all unique tags
            if (data.tags && Array.isArray(data.tags)) {
              data.tags.forEach((tag: string) => tagsSet.add(tag));
            }
            if (data.tag) {
              tagsSet.add(data.tag);
            }
          });
          
          setQuestions(questionsData);
          setAllTags(Array.from(tagsSet).sort());
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };
    
    fetchQuestions();
  }, [sortOrder]);

  const filteredQuestions = questions.filter(q => {
    // Filter by search term
    const matchesSearch = 
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      q.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.tag && q.tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (q.tags && q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    // Filter by status
    const matchesStatus = filterStatus === "all" || q.status === filterStatus;
    
    // Filter by tag
    const matchesTag = selectedTag === "all" || 
      (q.tag === selectedTag) || 
      (q.tags && q.tags.includes(selectedTag));
    
    return matchesSearch && matchesStatus && matchesTag;
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex justify-between items-center px-6 py-3 bg-white shadow-md w-full">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex gap-6 md:gap-10">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-800 text-transparent bg-clip-text">
                ClassMate
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
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-black">All Questions</h1>
          <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
            <Link to="/ask">Ask a Question</Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search questions..." 
              className="pl-8 rounded-full bg-white"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={toggleSortOrder}>
              {sortOrder === "desc" ? <SortDesc className="h-4 w-4 mr-2" /> : <SortAsc className="h-4 w-4 mr-2" />}
              {sortOrder === "desc" ? "Newest First" : "Oldest First"}
            </Button>
          </div>
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
                        {question.tags && question.tags.length > 0 ? (
                          question.tags.map((tag, index) => (
                            <Badge key={index}>{tag}</Badge>
                          ))
                        ) : question.tag ? (
                          <Badge>{question.tag}</Badge>
                        ) : null}
                        <span className="text-sm text-gray-500">
                          {question.answers.length} {question.answers.length === 1 ? 'answer' : 'answers'}
                        </span>
                        <Badge variant={question.status === 'open' ? 'default' : 'secondary'}>
                          {question.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Posted by {question.userName}</span>
                        <span>•</span>
                        <span>{question.createdAt ? new Date(question.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date'}</span>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/question/${question.id}`}>
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
              <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
                <Link to="/ask">Ask a Question</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 