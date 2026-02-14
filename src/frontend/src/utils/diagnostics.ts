/**
 * Production-safe diagnostics utility for logging initialization failures
 * without exposing sensitive data like tokens or principals.
 */

type DiagnosticStep = 
  | 'internet-identity-init'
  | 'actor-creation'
  | 'profile-query'
  | 'admin-query';

/**
 * Redacts sensitive values from error messages and URLs
 */
function redactSensitive(message: string): string {
  // Redact caffeineAdminToken and similar secret parameters
  return message
    .replace(/caffeineAdminToken=[^&\s]*/gi, 'caffeineAdminToken=***')
    .replace(/token=[^&\s]*/gi, 'token=***')
    .replace(/secret=[^&\s]*/gi, 'secret=***')
    .replace(/key=[^&\s]*/gi, 'key=***');
}

/**
 * Logs a diagnostic message for a failed initialization step
 */
export function logInitFailure(step: DiagnosticStep, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const redactedMessage = redactSensitive(errorMessage);
  
  const stepLabels: Record<DiagnosticStep, string> = {
    'internet-identity-init': 'Internet Identity initialization',
    'actor-creation': 'Backend actor creation',
    'profile-query': 'User profile query',
    'admin-query': 'Admin status query',
  };
  
  console.error(
    `[App Init Failed] ${stepLabels[step]} failed:`,
    redactedMessage
  );
}

/**
 * Logs a general runtime error with redaction
 */
export function logRuntimeError(error: unknown, context?: string): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const redactedMessage = redactSensitive(errorMessage);
  const stack = error instanceof Error ? error.stack : undefined;
  
  console.error(
    `[Runtime Error]${context ? ` ${context}:` : ''}`,
    redactedMessage
  );
  
  if (stack) {
    console.error('[Stack trace]', redactSensitive(stack));
  }
}

/**
 * Logs successful initialization step (for debugging)
 */
export function logInitSuccess(step: DiagnosticStep): void {
  const stepLabels: Record<DiagnosticStep, string> = {
    'internet-identity-init': 'Internet Identity',
    'actor-creation': 'Backend actor',
    'profile-query': 'User profile',
    'admin-query': 'Admin status',
  };
  
  console.log(`[App Init] ${stepLabels[step]} ready`);
}
