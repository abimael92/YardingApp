# Environment Handling

## Strategy
- Store secrets in `.env.local` (never commit).
- Use `.env.example` only when needed for onboarding.
- Only expose public config with the `NEXT_PUBLIC_` prefix.

## Validation
- Validate required environment variables at app start.
- Fail fast if required values are missing.

## Separation
- Use separate values for development, staging, and production.
