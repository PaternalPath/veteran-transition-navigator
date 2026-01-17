# Security Documentation

This document describes the security measures, data handling practices, and AI safety considerations for the Veteran Transition Navigator.

---

## Operating Modes

### Demo Mode (Default)

**When**: No `ANTHROPIC_API_KEY` environment variable set

**Behavior**:

- Uses deterministic, template-based career pathway generation
- **Zero external API calls** - all processing happens locally
- **No data is transmitted** to third-party services
- Suitable for demonstrations, testing, and privacy-conscious deployments

**Data Flow** (Demo Mode):

```
User Input → Validation → Template Selection → Response
         (No external network calls)
```

### Real Mode

**When**: `ANTHROPIC_API_KEY` environment variable is set

**Behavior**:

- Uses Anthropic AI (Claude) for personalized career pathway analysis
- Veteran profile data is sent to Anthropic's API
- Responses are generated using AI based on the submitted profile

**Data Flow** (Real Mode):

```
User Input → Validation → Anthropic API → AI Analysis → Response
                                ↑
                      (Data sent to Anthropic)
```

---

## Data Handling

### What Data is Stored

**None** - This application is stateless.

- No database or persistent storage
- No cookies (except Next.js session cookies)
- No user authentication or tracking
- Profile data is processed and discarded after response

### What Data is Sent to External Services

#### Demo Mode

- **Nothing** - All processing is local

#### Real Mode

When using Real Mode (with `ANTHROPIC_API_KEY` set), the following veteran profile data is sent to Anthropic:

- Military service details (branch, years, rank, MOS)
- Technical skills and certifications
- Leadership experience description
- Family status and dependents count
- Spouse employment status
- Current location and relocation preferences
- Career goals and income expectations
- Education interests and timeline

**Important**:

- Data is sent over HTTPS
- Anthropic's API privacy policy applies: https://www.anthropic.com/privacy
- Anthropic does not train models on API data (as of their current policy)
- Profile data includes personal information (PII) - users should be aware

### What Data is Logged

**Server-side logging** (controlled):

- API errors (sanitized - no stack traces sent to client)
- Rate limit violations (IP address and timestamp)
- Request validation failures (field names, not values)

**Never logged**:

- Full veteran profiles
- API keys (`ANTHROPIC_API_KEY` or other secrets)
- Personally identifiable information (PII) in plain text

---

## Rate Limiting

### Current Implementation

**Type**: In-memory, per-IP rate limiting

**Limits**:

- **10 requests per IP** per 15-minute window
- Applies to `POST /api/analyze` endpoint only

**Behavior**:

- Request counter resets every 15 minutes
- Exceeding limit returns HTTP 429 with `Retry-After` header
- Rate limit state is stored in server memory (resets on deployment)

**Rate Limit Headers** (returned with every request):

- `X-RateLimit-Limit: 10`
- `X-RateLimit-Remaining: <count>`
- `X-RateLimit-Reset: <timestamp>`

### Limitations of In-Memory Rate Limiting

**For small-scale deployments**, this is sufficient. However, be aware:

- Rate limits reset when the server restarts
- In serverless/edge environments (Vercel), each function instance has its own memory
- Not shared across multiple servers/instances

**For production at scale**, consider:

- Redis-based rate limiting (shared state)
- Vercel KV (edge storage)
- Cloudflare rate limiting (at CDN layer)
- API gateway rate limiting (AWS API Gateway, etc.)

---

## Request Validation & Security

### Input Validation

All requests to `/api/analyze` are validated using **Zod schemas**:

- Required fields must be present
- Data types must match (strings, numbers, arrays)
- Invalid requests return HTTP 400 with field-level error messages

### Request Size Limit

- **Max body size**: 100KB
- Oversized requests return HTTP 413
- Prevents denial-of-service via large payloads

### Error Handling

**Client-facing errors** (never include):

- Stack traces
- Internal file paths
- Environment variable values
- Database queries or internal state

**Error responses** are structured as:

```json
{
  "error": "User-friendly message",
  "details": [
    /* optional field-level validation errors */
  ]
}
```

---

## Responsible AI Disclosure

### Demo Mode Disclosure

When running in Demo Mode, users should understand:

- Pathways are **deterministic templates**, not AI-generated
- Recommendations are general-purpose, not personalized
- Based on common military-to-civilian transition patterns

**Suggested UI disclosure**:

> "Demo Mode: Using template-based recommendations. For AI-powered personalized analysis, contact your administrator to enable Real Mode."

### Real Mode Disclosure

When running in Real Mode, users should be informed:

- Profile data is sent to Anthropic (third-party AI provider)
- Analysis is AI-generated and should be validated by career professionals
- Recommendations are suggestions, not guarantees
- AI may have biases or limitations in understanding specific MOS codes

**Suggested UI disclosure**:

> "Real Mode: Your profile is analyzed using AI (powered by Anthropic). Results are suggestions and should be reviewed with a career counselor. By submitting, you agree to have your profile processed by our AI partner."

---

## Privacy Recommendations

### For Administrators

1. **Default to Demo Mode** for privacy-conscious deployments
2. **Use Real Mode only when**:
   - Users are informed their data will be sent to Anthropic
   - You have appropriate data processing agreements
   - Users consent to AI analysis
3. **Consider adding**:
   - Privacy policy page
   - Terms of service
   - Cookie notice (if adding analytics)
   - GDPR/CCPA compliance measures (if applicable)

### For Users

1. **Do not enter**:
   - Social Security Numbers
   - Full home addresses
   - Phone numbers
   - Email addresses
   - Sensitive medical information
   - Financial account details
2. **Be aware**:
   - In Real Mode, your profile is sent to a third-party AI service
   - Recommendations are AI-generated and may not be perfect
   - Always verify career advice with human professionals

---

## API Key Security

### Storing API Keys

**Never** commit API keys to git or include them in code.

**Recommended**:

- Use environment variables (`.env.local` file, never committed)
- Use Vercel environment variables (in project settings)
- Use secrets management (AWS Secrets Manager, HashiCorp Vault, etc.)

**Check your git history**:

```bash
git log --all --full-history --source -- .env
```

### Revoking Compromised Keys

If `ANTHROPIC_API_KEY` is accidentally committed:

1. **Immediately revoke** the key in Anthropic Console
2. **Generate a new key** and update environment variables
3. **Remove from git history** using BFG Repo-Cleaner or `git filter-branch`
4. **Force-push** cleaned history (if repository is shared)
5. **Rotate all other secrets** as a precaution

---

## Compliance Considerations

### GDPR (European Union)

If serving European users:

- Provide clear privacy policy explaining data processing
- Obtain explicit consent before sending data to Anthropic
- Implement data deletion requests (if you add storage later)
- Document lawful basis for processing (consent, legitimate interest, etc.)

### CCPA (California)

If serving California residents:

- Disclose data collection and sharing practices
- Provide opt-out mechanism for data sales (not applicable if stateless)
- Honor user data deletion requests

### HIPAA (Healthcare)

This application **is not HIPAA compliant** in its current form:

- Medical/disability information should not be entered
- No Business Associate Agreement with Anthropic
- No encryption at rest (stateless, but if you add storage)

**If you need HIPAA compliance**, consult with a healthcare compliance attorney.

---

## Security Checklist

Before deploying to production:

- [ ] Verify Demo Mode works with no API key set
- [ ] Test rate limiting (make 11+ requests, expect HTTP 429)
- [ ] Confirm no API keys are committed to git
- [ ] Add privacy policy and terms of service
- [ ] Configure HTTPS (automatic on Vercel, most hosts)
- [ ] Set up monitoring/alerting for errors
- [ ] Review Anthropic's privacy policy and terms
- [ ] Add user disclosure about AI usage (if Real Mode)
- [ ] Test CORS settings (if building separate frontend)
- [ ] Enable security headers (CSP, X-Frame-Options, etc.)

---

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** open a public GitHub issue
2. Email the maintainer privately (see README for contact)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if known)

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Anthropic Privacy Policy](https://www.anthropic.com/privacy)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/security)
- [Vercel Security Documentation](https://vercel.com/docs/security)

---

**Last Updated**: 2026-01-17
