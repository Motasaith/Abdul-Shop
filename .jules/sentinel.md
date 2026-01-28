## 2024-05-22 - Sensitive Information Logging Pattern
**Vulnerability:** Multiple endpoints (`/register`, `/orders`, `/newsletter`) were logging the entire `req.body` to the console using `console.log`.
**Learning:** This practice exposed sensitive information such as plaintext passwords, user addresses, phone numbers, and email addresses in the server logs. This typically happens when developers use `console.log` for debugging during development and forget to remove it before production, or don't realize that `req.body` contains sensitive fields.
**Prevention:**
1.  Enforce a strict "no console.log" policy for production code or use a linter rule to catch `console.log`.
2.  Use a proper logging library (e.g., Winston, Bunyan) with redaction capabilities for sensitive fields (password, token, credit card, etc.).
3.  Never log `req.body` blindly. If debugging is needed, log specific, non-sensitive fields only.
