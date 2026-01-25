# Input Validation

## Approach
- Use `zod` for schema validation in forms and API handlers.
- Validate on both client and server for any user-provided data.

## Rules
- Reject unexpected fields and malformed input.
- Normalize data (trim, lowercase) when applicable.
- Return user-safe error messages.
