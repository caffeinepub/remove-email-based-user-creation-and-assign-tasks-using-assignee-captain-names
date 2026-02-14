import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { logActorReconnectAttempt, logActorReconnectSuccess } from '../utils/diagnostics';
import { getBackendCanisterIdOverride } from '../utils/urlParams';

const ACTOR_TIMEOUT_MS = 15000; // 15 seconds
const MAX_RECONNECT_ATTEMPTS = 3;

interface UseSafeActorReturn {
  actor: ReturnType<typeof useActor>['actor'];
  isFetching: boolean;
  error: Error | null;
  isReconnecting: boolean;
  reconnect: () => void;
  shouldFallbackToReload: boolean;
}

/**
 * Wraps useActor with timeout protection and reconnection logic
 * Tracks reconnection attempts and provides fallback to page reload after max attempts
 */
export function useSafeActor(): UseSafeActorReturn {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [timeoutError, setTimeoutError] = useState<Error | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectInProgressRef = useRef(false);
  const lastActorRef = useRef(actor);

  // Detect actor creation failure (fetching stopped but no actor)
  const actorError = !isFetching && !actor && reconnectAttempts === 0 
    ? new Error('Failed to create backend actor') 
    : null;

  // Set up timeout for actor fetching
  useEffect(() => {
    if (isFetching) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        if (isFetching) {
          setTimeoutError(new Error('Actor initialization timed out after 15 seconds'));
        }
      }, ACTOR_TIMEOUT_MS);
    } else {
      // Clear timeout when fetching completes
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setTimeoutError(null);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isFetching]);

  // Track successful actor creation after reconnection
  useEffect(() => {
    if (actor && actor !== lastActorRef.current && isReconnecting) {
      logActorReconnectSuccess();
      setIsReconnecting(false);
      setReconnectAttempts(0);
      reconnectInProgressRef.current = false;
    }
    lastActorRef.current = actor;
  }, [actor, isReconnecting]);

  const reconnect = () => {
    // Prevent multiple simultaneous reconnection attempts
    if (reconnectInProgressRef.current) {
      console.log('[useSafeActor] Reconnection already in progress, skipping...');
      return;
    }

    reconnectInProgressRef.current = true;
    const nextAttempt = reconnectAttempts + 1;
    setReconnectAttempts(nextAttempt);
    setIsReconnecting(true);

    const usingOverride = !!getBackendCanisterIdOverride();
    logActorReconnectAttempt(nextAttempt, usingOverride);

    // Trigger actor recreation by invalidating the actor query
    queryClient.invalidateQueries({ queryKey: ['actor'] });
    queryClient.refetchQueries({ queryKey: ['actor'] });
  };

  const shouldFallbackToReload = reconnectAttempts >= MAX_RECONNECT_ATTEMPTS;

  return {
    actor,
    isFetching,
    error: timeoutError || actorError,
    isReconnecting,
    reconnect,
    shouldFallbackToReload,
  };
}
