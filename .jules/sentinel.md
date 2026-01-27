## 2024-05-23 - Cleartext Password Logging
**Vulnerability:** Found `console.log('Registration attempt:', req.body)` in the auth controller, which writes user passwords in cleartext to standard output/logs.
**Learning:** Developers often use full body logging for debugging convenience without considering the security implications of sensitive fields like passwords or tokens.
**Prevention:** Always sanitize logs by destructuring and excluding sensitive fields (password, tokens, PII) before printing. Consider using a structured logger (like Winston/Bunyan) with redaction capabilities.
