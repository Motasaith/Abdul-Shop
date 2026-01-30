## 2024-05-22 - Plaintext Password Logging
**Vulnerability:** The application was logging the entire `req.body` to stdout in the `/register` endpoint, which includes the user's plaintext password.
**Learning:** Debug logs added during development ("Registration attempt:") were not removed or guarded before production, and the `User` model validation in tests was outdated, masking the issue in CI.
**Prevention:** Use a structured logger with redaction capabilities for sensitive fields, or enforce linting rules that forbid `console.log` in backend routes.
