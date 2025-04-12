import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth, db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireMentor?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireMentor = false }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMentor, setIsMentor] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        if (requireMentor) {
          const mentorDoc = await getDoc(doc(db, 'mentors', user.uid));
          setIsMentor(mentorDoc.exists());
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [requireMentor]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/mentor/login" state={{ from: location }} replace />;
  }

  if (requireMentor && !isMentor) {
    return <Navigate to="/mentor/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 