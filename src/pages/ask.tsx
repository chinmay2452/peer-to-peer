import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import Badge from '@/components/ui/badge';
import { db, auth, storage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable, listAll } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { ImageIcon, VideoIcon, XIcon } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
  content: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  createdAt: string;
  tags: string[];
  photoUrl?: string;
  videoUrl?: string;
  status: 'open' | 'closed';
}

const fetchQuestionsFromStorage = async (): Promise<Question[]> => {
  try {
    const questionsRef = ref(storage, 'questions');
    const result = await listAll(questionsRef);
    const questions: Question[] = [];

    for (const item of result.items) {
      if (item.name.endsWith('_question.json')) {
        const url = await getDownloadURL(item);
        const response = await fetch(url);
        const questionData = await response.json();
        questions.push({
          ...questionData,
          id: item.name.replace('_question.json', '')
        });
      }
    }

    return questions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
};

export default function AskQuestion() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size must be less than 5MB');
        return;
      }
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError('Video size must be less than 50MB');
        return;
      }
      setSelectedVideo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (tags.length < 5 && !tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);
      setUploadProgress(0);
      setError(null);

      let photoUrl = null;
      let videoUrl = null;

      // Handle photo upload
      if (selectedPhoto) {
        try {
          console.log('Starting photo upload...');
          const photoRef = ref(storage, `questions/${Date.now()}_${selectedPhoto.name}`);
          const photoMetadata = {
            contentType: selectedPhoto.type,
            cacheControl: 'public,max-age=300',
          };

          const uploadTask = uploadBytesResumable(photoRef, selectedPhoto, photoMetadata);

          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
              console.log('Upload progress:', progress);
            },
            (error) => {
              console.error('Photo upload error:', error);
              throw new Error('Failed to upload photo: ' + error.message);
            }
          );

          const photoSnapshot = await uploadTask;
          photoUrl = await getDownloadURL(photoSnapshot.ref);
          console.log('Photo upload completed:', photoUrl);
        } catch (error) {
          console.error('Photo upload failed:', error);
          throw new Error('Failed to upload photo. Please try again.');
        }
      }

      // Handle video upload
      if (selectedVideo) {
        try {
          console.log('Starting video upload...');
          const videoRef = ref(storage, `questions/${Date.now()}_${selectedVideo.name}`);
          const videoMetadata = {
            contentType: selectedVideo.type,
            cacheControl: 'public,max-age=300',
          };

          const uploadTask = uploadBytesResumable(videoRef, selectedVideo, videoMetadata);

          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
              console.log('Upload progress:', progress);
            },
            (error) => {
              console.error('Video upload error:', error);
              throw new Error('Failed to upload video: ' + error.message);
            }
          );

          const videoSnapshot = await uploadTask;
          videoUrl = await getDownloadURL(videoSnapshot.ref);
          console.log('Video upload completed:', videoUrl);
        } catch (error) {
          console.error('Video upload failed:', error);
          throw new Error('Failed to upload video. Please try again.');
        }
      }

      // Create question in Firestore
      const questionData = {
        title,
        description: content,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhotoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        tag: tags.length > 0 ? tags[0] : '', // Using the first tag as the main tag
        tags: tags.length > 0 ? tags.map(tag => tag.toLowerCase()) : [],
        photoUrl,
        videoUrl,
        status: 'open',
        answers: [],
        bestAnswerId: null
      };

      console.log('Saving question with tags:', questionData.tags);

      // Add question to Firestore
      await addDoc(collection(db, 'questions'), questionData);

      // Reset form
      setTitle('');
      setContent('');
      setTags([]);
      setSelectedPhoto(null);
      setSelectedVideo(null);
      setPhotoPreview(null);
      setVideoPreview(null);
      setUploadProgress(0);
      navigate('/doubtboard');
    } catch (error) {
      console.error('Error creating question:', error);
      setError(error instanceof Error ? error.message : 'Failed to create question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Ask a Question</CardTitle>
            <CardDescription>
              Share your knowledge and get help from the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAskQuestion}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <Input
                    id="title"
                    placeholder="What's your question? Be specific."
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                    className="w-full text-white"
                  />
                </div>
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Textarea
                    id="content"
                    placeholder="Provide more context about your question..."
                    value={content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                    className="w-full min-h-[150px] text-white"
                  />
                </div>
                <div>
                  <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <Input
                    id="tag"
                    placeholder="Add tags (e.g., JavaScript, React, Algebra)"
                    value={tagInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="w-full text-white"
                  />
                </div>
                
                {/* Media Upload Section */}
                <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Add Media (Optional)
                    </label>
                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          ref={photoInputRef}
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                        >
                          <ImageIcon className="h-5 w-5 mr-2" />
                          Add Photo
                        </label>
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          ref={videoInputRef}
                          accept="video/*"
                          onChange={handleVideoSelect}
                          className="hidden"
                          id="video-upload"
                        />
                        <label
                          htmlFor="video-upload"
                          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                        >
                          <VideoIcon className="h-5 w-5 mr-2" />
                          Add Video
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Photo Preview */}
                  {photoPreview && (
                    <div className="relative">
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="max-h-48 rounded-md object-contain"
                      />
                    </div>
                  )}
                  
                  {/* Video Preview */}
                  {videoPreview && (
                    <div className="relative">
                      <video 
                        src={videoPreview} 
                        controls 
                        className="w-full max-h-48 rounded-md"
                      />
                    </div>
                  )}
                </div>
                
                {/* Show error message if any */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                  </div>
                )}

                {/* Show upload progress */}
                {isSubmitting && uploadProgress > 0 && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Uploading... {Math.round(uploadProgress)}%
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Posting...' : 'Post Question'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  } else {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
}