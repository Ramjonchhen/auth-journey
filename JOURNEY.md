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
```bash
curl http://localhost:3000/public
curl http://localhost:3000/api/balance  # Returns data without auth!
```

**The Problem:**
Balance data should be protected. Anyone can see it.

---

### Step 2: Session Auth (Unsigned)
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

### Step 3: Session Auth (Signed) ← YOU ARE HERE
**Commit:** `5ec770c31f414eda42f382c16c1c55bba989a27c`
**Quick Note:** In Step3, we need to use both linear sessionId and secure cryptographic sessionIds, go to backend/routes/auth.js to switch sessionId format accordingly 

**Objective:** Make sessionId unforgeable, patch the vulnerability of Step2: Unsigned Session

**What You'll Learn:**
- Cryptographic signing
- Why signatures prevent tampering
- HMAC and hashing

**The Problem We're Solving:**
In step2: Unsigned Sessions, we could easily get access to other session resources, by switching sessionId from one to another. In step3, we solve this issue, by switching from previous unsigned session to signed session through the use of HMAC signed server session.

**Background Theory:**
Necessary background theory & concepts required for step-3 are explained below:
### Hashing: 
Hashing is a process of using an algorithm, to convert data of any size to an fix length string of characters. The mathematical formula / algorithm used in the process is called hash function.

Example: Consider an simple hashing algorithm smart hash, which generates 3 bit output, here are various input, output for this algorithm
a. Empty Input ('') -> 011
b. Large Input ( 'auth journey project is so exciting' ) -> 111
c. Medium Size Input ( 'auth journey project' ) -> 101
d. Simple Input ( 'abc' ) -> 010 
e. Simple Input Again ( 'abc' -> 010 )

From the above input and output example, we can distinguish the following properties of hashing:

i. Fixed Size:
The output of the hash function is always of fixed size, no matter the size of input, whether it be extremely large or small, the output is always of fixed size.

ii. Deterministic
For the exact same hash input, hash function will always generate the same hash output. Example can be seen with the has input of "abc' run twice.

iii. One Way 
Only hash output can be computed from hash input. We can't compute hash input back from the output produced. It's practically impossible to reverse the hash input from it's output.

### HMAC (Hash-based Message Authentication Code)
HMAC is a cryptographic methods, that takes an secret key and a hash function ( like SHA-256 ) to simultaneously verify both the data integrity (the message hasn't been altered in transit) and the authenticity (the message genuinely came from an expected source) of a message.

To mitigate the vulnerability of un-signed session, HMAC can be used to provide unique identifier for a session which can't be tampered and prove authenticity. On successful session sign-in, when generating sessionId, we generate an unique session signature for that session, such that when accessing session resource, we require both sessionId and session signature. 

For demonstration purposes: HMAC Secret Key = HMAC_secret & Hash Function: SHA-256

For successful session sign with sesssionId: 1, we create it's session signature as: 
HMAC_HASH_FUNCTION(sessionId + HMAC_secret ) =  SHA-256 ( 1 + SERVER-SECRET ) = HMAC_OUTPUT_FOR_SESSION_ID_1 ( arbitrary output for example )

Now when we try to access session resources we have to send the session signature along with sessionId.

we do the following check, HMAC_HASH_FUNCTION(sessionId + HMAC_secret ) = SHA-256( 1 + SERVER-SECRET ) is equal or not to: client_sent_signature 

HMAC provide us the data integrity and authenticity by following way:
i. The secret key to produce HMAC is present on secure place, thus only server can produce authentic session signature and even after we know sessionId we can't create session signature for it.
ii. Due to the nature of hashing, we can't reverse back the input from hash output and reverse engineer the process.
iii. Only valid session signature gets access to session resource, invalid session signature for a session will be immediately rejected.

**Test You'll Run:**
Let's see signed session in action for the same last test setup which we did.

Normal user1 logins with credentials: 

```
 curl -X POST http://localhost:3000/api/auth/login \                                            
  -H "Content-Type: application/json" \
  -d '{"username":"user_1","password":"password_1"}'
```
Response: {"sessionId":1,"sessionSignature":"41402ec10b059bbfed38159d826595d6a72d701e269534f939e2b3f1a0c5b876"}%

User not only gets sessionId upon login but also gets sessionSignature now.

Now to access session resource, providing only x-session-id is not enough.

```
 curl http://localhost:3000/api/user/balance -H "x-session-id: 1"
```
Response: {"error":"Missing Session Header"}%  

We must also provide x-session-signature additional identity to access session resource, let us provide x-session-signature

```
curl http://localhost:3000/api/user/balance -H "x-session-id: 1" \                              
 -H 'x-session-signature: 41402ec10b059bbfed38159d826595d6a72d701e269534f939e2b3f1a0c5b876'
```
Response: {"balance":5000,"currency":"USD"}%   

Only after providing session signature they can access session resource, now let's move to our wanna be hacker user2, the user2 logins and get sessionId and sessionSignature

```
 curl -X POST http://localhost:3000/api/auth/login \                                           
  -H "Content-Type: application/json" \
  -d '{"username":"user_2","password":"password_2"}'
```
Response: {"sessionId":2,"sessionSignature":"13bdc85c78341b1187a639b7e1d19885d2fd177b2969adf3dbb83a892fd3c49e"}%

User2 gets valid sessionId and sessionSignature, now our wanna be hacker tries to change sessionId to other valid sessionId: 1, with the valid session signature he got for sessionId: 2

```
curl http://localhost:3000/api/user/balance -H "x-session-id: 1" \                             
-H 'x-session-signature: 13bdc85c78341b1187a639b7e1d19885d2fd177b2969adf3dbb83a892fd3c49e'
```
Response: {"error":"Not authenticated"}% 
Now the user-2 can't simply change the sessionId and access the session resource, we need valid session signature, the signature he got is only valid for sessionId: 2, yes we've got the sessionSignature for sessionId: 1 on the docs for demo purpose, but in real life until the HMAC_SECRET is exposed, nobody can compute valid session signature, only the server can create it and verify easily. This is what signed session protect us with, in the same setup anybody could access another session resource, now we need identity verification for it. This is the patch to previous problem we had.


**Why This Matters:**
Even if someone guesses the sessionId format, they can't create a valid signature. Only those with valid session signature and identity can access the session resource, compared to unsigned session with random linear sessionId, where anybody can access session resource just by switching to another sessionId.

**Step3: Defense in Depth**
In Step3, at the end we again switched back to cryptographic random secure IDs, to make the system as much as secure as possible. Let me explain, we already have added session signature and no one can access session resource without it, then why do we need to switch back to cryptographic ID from the linear sequential ID we have? I had the same question in my mind, and here is the answer to it, the concept is called defense in depth.

Consider this, we have signed sessionId with linear sequential IDs like we have 1,2,3...., now session is secured with session signature, now think like this, what if the HMAC session signature secret gets leaked, now the attacker when it gets access to HMAC session secret, the attacker can easily compute HMAC session signature in seconds, as the next sessionId is easily predictable. 

Random secure cryptographic adds extra layer of security to this. Even if the secret key for HMAC is exposed, for a large random secure sessionId, finding the next sessionId is practically impossible. Random Secure SessionID adds extra layer of security to signed session, signing prevents forgery, randomness prevents enumeration.

Even if we don't use signed session, unsigned session which requires only sessionId, random secure sessionId can workout even without requiring signature, because finding the next sessionId is practically impossible and thus we can skip the signature process.

Defense in Depth means securing system as much as possible, we explored various ways and identified the flaws ourselves to acknowledge why we need to secure system to depth and where does our design choices lead us to.

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

### After Step 3 Completion
**Questions to think about:**
- What are the pros and cons of every method that we choose?
- What if the secure session signature secret leaks out?
- Can our secure solution still have vulnerabilities? 

**Aha moments:**
- We need a defense in depth, a secure system as much as possible
- We have to think about every aspect to break our system and make it as secure as possible.

---

## Current Progress

✅ Step 1: Simple API (no auth)
✅ Step 2: Session auth (unsigned)
✅ Step 3: Session auth (signed)
⏭️  Step 4: HTTP-Only cookies + XSS testing
⏭️  Step 5: JWT tokens
⏭️  Step 6: Refresh tokens
⏭️  Phase 2: Authorization (roles, permissions)

---

## Viewing the Full Git History

Use these commands to explore:

```bash
# See all commits
git log --oneline

# See what changed in each step
git show <commit-hash>

# Compare two steps
git diff step-1 step-2

# Checkout an old step
git checkout step-1  # See code from Step 1
git checkout main    # Back to latest
```

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
