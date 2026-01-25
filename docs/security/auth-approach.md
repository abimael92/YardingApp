# Authentication Approach

## Recommended Solution
Use Auth.js (NextAuth) with a JWT session strategy and database adapter when a
backend is introduced. This keeps the App Router server-centric and avoids
client-side token storage.

## Rationale
- Works natively with Next.js App Router.
- Supports role claims in JWT/session.
- Allows future upgrade to OAuth providers without rewiring routes.

## Session Strategy
- Use secure, httpOnly cookies for session tokens.
- Keep role and user ID in the session payload.
