import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function AccessDeniedScreen() {
  const { login, loginStatus } = useInternetIdentity();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <ShieldAlert className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Authentication Required</CardTitle>
          <CardDescription>Please log in to access TaskTracker</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={login}
            disabled={loginStatus === 'logging-in'}
            className="w-full"
            size="lg"
          >
            {loginStatus === 'logging-in' ? 'Logging in...' : 'Log In'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
