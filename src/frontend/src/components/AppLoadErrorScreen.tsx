import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, RotateCcw, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AppLoadErrorScreenProps {
  message?: string;
  detailedMessage?: string;
  onReload?: () => void;
  onRetry?: () => void;
  onResetAndRetry?: () => void;
  showResetOption?: boolean;
  isReconnecting?: boolean;
  shouldFallbackToReload?: boolean;
}

/**
 * User-facing error screen for app load failures with multiple recovery options
 * Shows clear English messages without exposing sensitive details, with loading states during reconnection
 */
export default function AppLoadErrorScreen({ 
  message = 'The app failed to load.',
  detailedMessage,
  onReload,
  onRetry,
  onResetAndRetry,
  showResetOption = false,
  isReconnecting = false,
  shouldFallbackToReload = false,
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
        
        {detailedMessage && (
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              {detailedMessage}
            </p>
          </CardContent>
        )}

        {shouldFallbackToReload && (
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Maximum reconnection attempts reached. The page will reload to restore connection.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}

        <CardFooter className="flex flex-col gap-2">
          {onRetry && (
            <Button 
              onClick={onRetry} 
              className="w-full"
              disabled={isReconnecting}
            >
              {isReconnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reconnecting...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Connection
                </>
              )}
            </Button>
          )}
          
          {showResetOption && onResetAndRetry && (
            <Button 
              onClick={onResetAndRetry} 
              variant="outline"
              className="w-full"
              disabled={isReconnecting}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Connection Settings
            </Button>
          )}

          {!onRetry && (
            <Button onClick={handleReload} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
