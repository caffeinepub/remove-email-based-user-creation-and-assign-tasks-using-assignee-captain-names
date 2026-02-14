import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface AppLoadErrorScreenProps {
  message?: string;
  onReload?: () => void;
  onRetry?: () => void;
}

/**
 * User-facing error screen for app load failures
 * Shows clear English message without exposing sensitive details
 */
export default function AppLoadErrorScreen({ 
  message = 'The app failed to load.',
  onReload,
  onRetry 
}: AppLoadErrorScreenProps) {
  const handleReload = () => {
    if (onReload) {
      onReload();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Unable to Load</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>Please try reloading the page. If the problem persists, check your internet connection or try again later.</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={handleReload} className="w-full">
            Reload Page
          </Button>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="w-full">
              Try Again
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
