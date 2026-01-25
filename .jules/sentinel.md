## 2026-01-25 - express-validator Logs Sensitive Data
**Vulnerability:** Plaintext passwords were leaked in server logs when validation failed.
**Learning:** `express-validator`'s `errors.array()` returns objects containing the `value` that failed validation. If the validated field is sensitive (like `password`), blindly logging these errors exposes the secret.
**Prevention:** Never log raw validation error objects. Sanitize them to remove the `value` property or log generic error messages for sensitive fields.
