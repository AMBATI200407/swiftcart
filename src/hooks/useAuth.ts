import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '@/integrations/supabase/client';
import { setAuth, setProfile, setLoading, setError, clearAuth } from '@/store/slices/authSlice';
import { RootState } from '@/store/store';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, session, profile, loading, error } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        dispatch(setAuth({ user: session?.user ?? null, session }));
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (error) throw error;
              dispatch(setProfile(profile));
            } catch (error) {
              console.error('Error fetching profile:', error);
              dispatch(setError('Failed to load user profile'));
            }
          }, 0);
        } else {
          dispatch(setProfile(null));
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setAuth({ user: session?.user ?? null, session }));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  const signUp = async (email: string, password: string, name: string, role: 'user' | 'seller' = 'user') => {
    try {
      dispatch(setLoading(true));
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            role,
          }
        }
      });

      if (error) throw error;
      
      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      });
      
      return { error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred during sign up';
      dispatch(setError(errorMessage));
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      dispatch(setLoading(true));
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });
      
      return { error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred during sign in';
      dispatch(setError(errorMessage));
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      dispatch(clearAuth());
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  };
};