# 📚 Auth Journey: Learning Authentication from Scratch

A practical learning project building authentication systems step-by-step,
breaking them intentionally to understand vulnerabilities, then fixing them.

## How to Use This Repository

### For Learning
1. Read the **Step Overview** below
2. Check out the branch for that step: `git checkout step-2-sessions`
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
**Commit:** `c228f20464ecb5dc6d44b1a22e6c8692b7782f03`

**What You'll Learn:**
- How sessions work
- In-memory session storage
- Middleware for protecting routes
- How an unsigned session is vulnerable & how it can be exploited

**Code:**
- `/api/auth/login` - Creates a server-side in-memory session
- Middleware validates the sessionId
- `/api/user/balance` - Protected route

**How Sessions Work:**
1. Login → Get random sequential sessionId ( Sequential SessionId like 1,2,3..)
2. Include sessionId in header → Access protected routes
3. Without sessionId → 401 error

**Testing:**
1. Log in and get the sessionId
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user_1","password":"password_1"}'
```

Response: {"sessionId": "1 ( or other linear sequential sessionId)"}

2. Use the sessionId to access the protected route
```
curl http://localhost:3000/api/user/balance \
  -H "x-session-id: 1"
```

3. Without sessionId, you get error
```
curl http://localhost:3000/api/user/balance 
```
 Response: {"error":"Not authenticated"}

### Using Linear Sequential ID Instead of Random Secure SessionID for Unsigned Sesisons

A quick note:  If you see the commit history through git log, you would see we switched to a linear sequential sessionId for the vulnerability demonstration.

We switched from secure random sessionId like: 9b6b654bd3456e95c4ca56589fc8e57e to linear sequential ID like 1,2,3. The reason will be explained below.

### The Vulnerability on Step2 & How to Exploit Step2 Solution?

Consider this scenario with two users: user_1 & user_2 ( you can find user credentials on the backend/constants.js ). user_1 is wanna be hacker and wants to exploit the system, user_2 is a simple user logging in to the platform.

user_1 genuinely logs in as a user by calling the login API:

```bash
curl -X POST http://localhost:3000/api/auth/login \                    
  -H "Content-Type: application/json" \
  -d '{"username":"user_1","password":"password_1"}'
```
Response: {"sessionId":1}

Now the user_1 calls the balance API with the sessionId provided.

```bash
curl http://localhost:3000/api/user/balance \                           
  -H "x-session-id: 1"
```
Response: {"balance":5000, "currency": "USD"}

user_1, who wants to exploit the system, thinks: what if I change the x-session-id on the balance API call, what will happen? If I change the sessionId, can I see other users’ balances? Is the balance API restricted to a particular user only? Can I find an exploit here?

The balance API only needs sessionId to provide the balance. The user must only guess what the next sessionId can be. For this, the user_1 can create fake user accounts and might log in through them and see the sessionId received. 

If they received the same kind of linear sessionId like 2,3.. on other login attempts, then the pattern of sessionId becomes predictable. The user can just try random linear sessionId, on the balance endpoint.

This is the reason we switched to a linear sequential ID for Step 2, because it gives us an environment of predictability and a chance to try an exploit. If we had a random sessionId like: 9b6b654bd3456e95c4ca56589fc8e57f, it would be really hard to guess the next one.

The user_1 for secure sessionId may try to tweak it by: 9b6b654bd3456e95c4ca56589fc8e57g something, but finding an active sessionId present on the server is next to impossible. But linear sequential ID gives us a chance to try the exploit, the user can try various sessionId like 2,3… This is the reason why we switched back to linear sequential ID.

Now let’s get back to the exploit experiment, user_1 thinks to try out a new sessionId on the balance endpoint: 

```bash
curl http://localhost:3000/api/user/balance -H "x-session-id: 2"
```

Any guess what will happen? 

Let me tell you what will happen if you look at the codebase balance API ( backend/routes/user.js ), there is a validateSession middleware for protecting the balance API.

Its job is to check whether the request contains the x-session-id header or not. If the header is not present, it throws an error; if the header is present, the middleware validation passes. And the balance API returns the balance of the user linked to the provided sessionId. 

On the user_1 calling the balance API with sessionId:2, if the server session has a record with an ID of 2, it sends the balance of that session user; if the sessionId is not present, it throws an error.

Just by passing sessionId we can access other session resources, this is vulnerability on the system and let's exploit it.

In one completely new terminal, log in as user_1

```bash
 curl -X POST http://localhost:3000/api/auth/login \                       
  -H "Content-Type: application/json" \
  -d '{"username":"user_1","password":"password_1"}'
```
Response: {"sessionId":1}

In a completely new terminal window, log in as user_2

```bash
curl -X POST http://localhost:3000/api/auth/login \                      
  -H "Content-Type: application/json" \
  -d '{"username":"user_2","password":"password_2"}'
```
Response: {"sessionId":2}

Now, in the 1st terminal where the user_1 logged in, you can easily get the balance of the user_1 as: 

```bash
curl http://localhost:3000/api/user/balance \                     
  -H "x-session-id: 1"
```
Response: {"balance":5000, "currency": "USD"}

Now try to switch the sessionId to 2 ( which was granted to user2 )

```
curl http://localhost:3000/api/user/balance \                          
  -H "x-session-id: 2"
```
Response: {"balance":10000, "currency": "EUR"}

Our session auth layer is easily exploitable; if we get access to another sessionId, we can access other session resources. Currently, it was just seeing the balance API, what if it were transferring money or deleting an account? If that were the case, we could do the protected API activities by just guessing the sessionId.

You might want to understand what the problem is with the un-signed session. Let me explain.

### Vulnerability explained with an Example

The problem is with the sessionId validation. It’s only to check whether you have an ID or not; it doesn’t validate whether that ID belongs to that user or not. It just wants an ID and gives access to resources belonging to it, no matter who provides the ID. 

The best analogy can be given with a school example. You and your friends go to the school. The school provides you with an ID for various purposes. There is an attendance system on school gate. To perform the attendance, you need a valid ID card; without it, you cannot perform the attendance. You can perform the attendance by your ID card, that's normal, but suppose your friend is absent, you have the friends ID card, you just show your friend's ID card at the gate, and voilà, you can do your friend's attendance. The attendance device doesn’t check who is doing your attendance, whether it’s you or your friends; it just wants the card only, and it will do the attendance. It will not check whether you are the one legit to do the attendance, whether that ID card is only assigned to you; it doesn’t do this check. This is the vulnerability and issue we have, which we will solve in the next Step 3: Signed Sessions.

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
