# Specification

## Summary
**Goal:** Fix the production “Unable to Load” failure by ensuring the frontend always initializes its backend actor using the currently deployed backend canister ID (or a user override when provided), eliminating stale/mismatched canister IDs as the cause.

**Planned changes:**
- Audit and update frontend backend-actor initialization to reliably resolve the correct backend canister ID in production (avoiding stale generated declarations and hardcoded/mismatched IDs).
- Ensure any supported backend canister override (e.g., `backendCanisterId` via session/URL/hash) is actually used during actor creation, and that “Reset Connection Settings” fully clears the override and restores default behavior.
- Add improved (redacted) console diagnostics when actor creation fails to indicate whether the default ID or an override was used, without logging secrets (e.g., admin tokens).

**User-visible outcome:** After deploy, the app loads successfully in production without landing on “Unable to Load” due to backend actor routing/canister ID mismatches, and connection resets/overrides behave predictably.
