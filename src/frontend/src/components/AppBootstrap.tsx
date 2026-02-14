import { ReactNode } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { useSafeActor } from '../hooks/useSafeActor';
import AppLoadErrorScreen from './AppLoadErrorScreen';
import AccessDeniedScreen from './AccessDeniedScreen';
import ProfileSetupModal from './ProfileSetupModal';
import { logInitFailure, logInitSuccess } from '../utils/diagnostics';
import { useEffect } from 'react';

interface AppBootstrapProps {
  children: (props: { userProfile: any; isAdmin: boolean }) => ReactNode;
}

/**
 * Handles authenticated app initialization with proper error handling and timeouts
 */
export default function AppBootstrap({ children }: AppBootstrapProps) {
  const { identity, isInitializing, isLoginError } = useInternetIdentity();
  const { actor, isFetching: actorFetching, error: actorError, refetch: refetchActor } = useSafeActor();
  
  const { 
    data: userProfile, 
    isLoading: profileLoading, 
    isFetched: profileFetched,
    error: profileError,
    refetch: refetchProfile 
  } = useGetCallerUserProfile();
  
  const { 
    data: isAdmin, 
    isLoading: adminLoading,
    error: adminError,
    refetch: refetchAdmin 
  } = useIsCallerAdmin();

  const isAuthenticated = !!identity;

  // Log initialization status
  useEffect(() => {
    if (isAuthenticated && !isInitializing) {
      logInitSuccess('internet-identity-init');
    }
  }, [isAuthenticated, isInitializing]);

  useEffect(() => {
    if (isLoginError) {
      logInitFailure('internet-identity-init', new Error('Internet Identity login failed'));
    }
  }, [isLoginError]);

  useEffect(() => {
    if (profileError) {
      logInitFailure('profile-query', profileError);
    }
  }, [profileError]);

  useEffect(() => {
    if (adminError) {
      logInitFailure('admin-query', adminError);
    }
  }, [adminError]);

  // Show loading during initialization
  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  // Show access denied for unauthenticated users
  if (!isAuthenticated) {
    return <AccessDeniedScreen />;
  }

  // Handle actor creation errors
  if (actorError) {
    return (
      <AppLoadErrorScreen
        message="Failed to connect to the backend service."
        onRetry={refetchActor}
      />
    );
  }

  // Handle profile query errors
  if (profileError && !profileLoading) {
    return (
      <AppLoadErrorScreen
        message="Failed to load your profile."
        onRetry={refetchProfile}
      />
    );
  }

  // Handle admin query errors
  if (adminError && !adminLoading) {
    return (
      <AppLoadErrorScreen
        message="Failed to verify your permissions."
        onRetry={refetchAdmin}
      />
    );
  }

  // Show profile setup for new users
  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;
  if (showProfileSetup) {
    return <ProfileSetupModal />;
  }

  // Show loading while fetching critical data
  if (actorFetching || profileLoading || adminLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Render main app
  return <>{children({ userProfile, isAdmin: isAdmin || false })}</>;
}
