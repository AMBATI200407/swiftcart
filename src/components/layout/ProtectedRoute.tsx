import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'user' | 'seller' | 'admin';
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate(redirectTo);
        return;
      }

      if (requiredRole && profile?.role !== requiredRole) {
        // Redirect based on user role
        switch (profile?.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'seller':
            navigate('/seller');
            break;
          default:
            navigate('/');
        }
      }
    }
  }, [user, profile, loading, navigate, requiredRole, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}