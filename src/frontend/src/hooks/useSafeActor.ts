import { useEffect, useState } from 'react';
import { useActor } from './useActor';
import { logInitFailure, logInitSuccess } from '../utils/diagnostics';
import type { backendInterface } from '../backend';

const ACTOR_TIMEOUT_MS = 15000; // 15 seconds

interface UseSafeActorResult {
  actor: backendInterface | null;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Wraps useActor with timeout and error handling for production reliability
 */
export function useSafeActor(): UseSafeActorResult {
  const { actor, isFetching } = useActor();
  const [error, setError] = useState<Error | null>(null);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    // Reset state on refetch
    setError(null);
    setTimeoutReached(false);

    // Set timeout for actor creation
    const timeoutId = setTimeout(() => {
      if (isFetching || !actor) {
        const timeoutError = new Error('Actor creation timed out after 15 seconds');
        setError(timeoutError);
        setTimeoutReached(true);
        logInitFailure('actor-creation', timeoutError);
      }
    }, ACTOR_TIMEOUT_MS);

    // Clear timeout if actor becomes available
    if (actor && !isFetching) {
      clearTimeout(timeoutId);
      logInitSuccess('actor-creation');
    }

    return () => clearTimeout(timeoutId);
  }, [actor, isFetching, refetchTrigger]);

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  return {
    actor: timeoutReached ? null : actor,
    isFetching: isFetching && !timeoutReached,
    error,
    refetch,
  };
}
