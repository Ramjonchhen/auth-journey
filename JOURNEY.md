# 📚 Auth Journey: Learning Authentication from Scratch

A practical learning project building authentication systems step-by-step,
breaking them intentionally to understand vulnerabilities, then fixing them.

## How to Use This Repository

### For Learning
1. Read the **Step Overview** below
2. Checkout the branch for that step: `git checkout step-2-sessions`
3. Read the **What You'll Learn** section
4. Try the **Exploit** section (yes, break it!)
5. Understand why it fails
6. Read the **What's Next** section

### For Code Review
- Check commit messages (they explain what changed)
- Use `git log --oneline` to see progression
- Use `git diff step-1 step-2` to see differences

---

## Step Breakdown

### Step 1: Simple API (No Auth)
**Commit:** `eba59f47` (See git log)

**What You'll Learn:**
- How a basic Express API works
- Why protecting routes matters
- The problem: Anyone can access anything

**Code:**
- Simple routes: GET /public, GET /api/balance
- No authentication

**Testing:**
\`\`\`bash
curl http://localhost:3000/public
curl http://localhost:3000/api/balance  # Returns data without auth!
\`\`\`

**The Problem:**
Balance data should be protected. Anyone can see it.

---

### Step 2: Session Auth (Unsigned) ← YOU ARE HERE
**Commit:** `aa38d1d84`

**What You'll Learn:**
- How sessions work
- In-memory session storage
- Middleware for protecting routes
- Why random sessionIds aren't enough alone

**Code:**
- `/api/auth/login` - Creates session
- Middleware validates sessionId
- `/api/user/balance` - Protected route

**How Sessions Work:**
1. Login → Get random sessionId
2. Include sessionId in header → Access protected routes
3. Without sessionId → 401 error

**Testing:**
\`\`\`bash
# 1. Login and get sessionId
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user_1","password":"password_1"}'

# Response: {"sessionId":"abc123..."}

# 2. Use sessionId to access protected route
curl http://localhost:3000/api/user/balance \
  -H "x-session-id: abc123..."

# 3. Without sessionId, you get error
curl http://localhost:3000/api/user/balance
# Response: {"error":"Not authenticated"}
\`\`\`

**The Vulnerability:**
Even though sessionId is random, it's **UNSIGNED**.
If someone knew another valid sessionId, they could use it.
SessionIds can be guessed (statistically small but possible).

---

### Step 3: Session Auth (Signed) - Coming Next
**Objective:** Make sessionId unforgeable

**What You'll Learn:**
- Cryptographic signing
- Why signatures prevent tampering
- HMAC and hashing

**The Problem We're Solving:**
Right now: sessionId is just a key
After Step 3: sessionId will be signed, can't be forged

**Test You'll Run:**
Try to modify sessionId → Signature won't match → 401 error

**Why This Matters:**
Even if someone guesses the sessionId format, they can't create a valid signature.

---

## 🔐 Security Concepts Learned at Each Step

| Step | Concept | Vulnerability | Protection |
|------|---------|----------------|-----------|
| 1 | No Auth | Anyone accesses data | ← Next step |
| 2 | Sessions | SessionId can be guessed/faked | ← Step 3 |
| 3 | Signed Sessions | SessionId tampering | ← Step 4 |
| 4 | HTTP-Only Cookies | XSS steals token | ← Step 5 |
| 5 | JWT Tokens | Can't logout immediately | ← Step 6 |
| 6 | Refresh Tokens | Stolen tokens valid forever | ← Future |

---

## 🚀 How to Follow This Journey

**Option A: Read and Learn**
- Read each step in JOURNEY.md
- Understand what was built
- See the commit messages

**Option B: Hands-On (Recommended)**
- Checkout Step 1: `git checkout step-1`
- Run the app, test it
- Checkout Step 2: `git checkout step-2`
- See how code changed
- Try the exploit
- Understand the fix

**Option C: Deep Dive**
- For each step, read the code
- Understand every line
- Try breaking it
- Read Step 3 to see the fix

---

## 📝 Reflections After Each Step

### After Step 2 Completion
**Questions to think about:**
- How would you crack sessionId without it being signed?
- What if sessionIds were just 1, 2, 3 instead of random?
- Why can't we just make longer random numbers?

**Aha moments:**
- Sessions need server-side storage
- Randomness alone isn't security
- We need cryptographic proof of authenticity

---

## Current Progress

✅ Step 1: Simple API (no auth)
✅ Step 2: Session auth (unsigned)
🔄 Step 3: Session auth (signed) - Building now
⏭️  Step 4: HTTP-Only cookies + XSS testing
⏭️  Step 5: JWT tokens
⏭️  Step 6: Refresh tokens
⏭️  Phase 2: Authorization (roles, permissions)

---

## Viewing the Full Git History

Use these commands to explore:

\`\`\`bash
# See all commits
git log --oneline

# See what changed in each step
git show <commit-hash>

# Compare two steps
git diff step-1 step-2

# Checkout an old step
git checkout step-1  # See code from Step 1
git checkout main    # Back to latest
\`\`\`

---

## How to Contribute / Expand

If you fork this and want to:
- Add a feature
- Create Step 7
- Add tests

Follow the pattern:
1. Create branch: `git checkout -b step-7-new-feature`
2. Make changes
3. Commit with clear message
4. Update JOURNEY.md
5. Open PR with explanation

---

## For GitHub Viewers

This isn't a "finished app". It's a **learning journey**.
- Code will be upgraded in each step
- Security will improve step-by-step
- That's the whole point

Read JOURNEY.md as a story, not a spec.