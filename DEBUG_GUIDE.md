# 🐛 DEBUGGING GUIDE - AI SUGGESTIONS NOT APPEARING

## Quick Checklist

- [ ] Server running on port 5000
- [ ] Frontend accessible on port 3000 or http-server port
- [ ] CORS errors fixed (now allows all localhost)
- [ ] GEMINI_API_KEY is set in `.env`
- [ ] Questions are not just greetings ("hi", "hello", etc.)
- [ ] Browser console shows Socket.io connected

---

## Why AI Suggestions Might Not Appear

### 1. **CORS Errors** ✅ FIXED
- Server was rejecting requests from frontend
- Fixed by allowing all localhost variants
- Restart server to apply changes

### 2. **Missing Gemini API Key**
**File:** `server/.env`
```env
GEMINI_API_KEY=YOUR_KEY_HERE
```
- Get key from: https://aistudio.google.com/app/apikeys
- Restart server after adding key

### 3. **Text-to-Speech Not Working** ✅ PARTIALLY FIXED
**Reason:** No 11Labs API Key
**File:** `server/.env`
```env
ELEVEN_LABS_API_KEY=YOUR_KEY_HERE
```
- Optional but recommended
- Get key from: https://elevenlabs.io/app/settings/api-keys
- Without it, text suggestions will still work (just no audio)

### 4. **Question Too Short or Is Greeting**
The system filters out greetings automatically:
- ❌ "hi" - filtered (too short and greeting)
- ❌ "hello" - filtered (greeting)  
- ❌ "bye" - filtered (greeting)
- ✅ "Can you deploy on-premise?" - accepted (real question)
- ✅ "What about encryption?" - accepted (real question)
- ✅ "Do you support X?" - accepted (real question)

---

## Testing Steps

### Step 1: Verify Backend Connection
```bash
curl -X GET http://localhost:5000/api/health
# Should return: {"status":"ok","service":"Caretta W26"}
```

### Step 2: Test Login
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","company":"Test Co"}'
```

### Step 3: Test AI Suggestion Endpoint
```bash
# First, get a token from login
# Then:
curl -X POST http://localhost:5000/api/ai/suggest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"sessionId":"test-session","prospectText":"Can you deploy on-premise?"}'
```

---

## Frontend Troubleshooting

### Open Browser Console (F12)

Look for:

1. **Connection Status**
   ```
   [SocketClient] ✅ Connected to server: socket_id_here
   ```
   - If missing → Socket.io not connecting

2. **API Call Errors**
   ```
   AI Coaching Error: [error message]
   ```
   - Check if CORS errors appear

3. **AI Response Received**
   ```
   AI Suggest Error / AI Response received
   ```
   - Check the actual response

---

## Complete Setup Verification

```bash
# 1. Verify MongoDB is running
mongosh

# 2. Check environment variables are set
cat server/.env

# 3. Restart server
cd server
npm install
npm start
# Should see: ✅ Caretta server running on http://localhost:5000

# 4. In another terminal, serve frontend
cd client
python -m http.server 3000
# Should see: Serving HTTP on 0.0.0.0 port 3000

# 5. Open browser and test
# http://localhost:3000
```

---

## Server Logs to Check

### ✅ Good Logs (What You Should See)
```
✅ Caretta server running on http://localhost:5000
✅ MongoDB connected: [cluster_name]
🔌 Client connected: socket_id
📞 Call started: session=session_id
Sending to Gemini API...
```

### ❌ Bad Logs (Problems to Fix)
```
[ERROR] CORS not allowed → Fix: Already done, restart server
❌ MongoDB connection error → Check MONGO_URI, ensure MongoDB is running
[ERROR] GEMINI_API_KEY → Add to .env and restart
TTS generation failed → Missing ELEVEN_LABS_API_KEY (optional)
```

---

## Real Test Scenario

1. **Open app:** `http://localhost:3000`
2. **Register/Login:** Create account
3. **Start Call:** Click "Start Call"
4. **Type Question:** Type "We need on-premise deployment. Can you support that?"
5. **Expected Result:**
   - ✅ Message appears in transcript
   - ✅ "Objection" badge appears
   - ✅ AI answer about on-premise deployment
   - ✅ "Play Audio" button appears (if 11Labs key is set)
   - ✅ Speaker icon shows response is ready

---

## Advanced: Enable Debug Logging

### On Server
Edit `server/src/services/llmService.js`:
```javascript
// Line ~75, after response received:
console.log('Gemini Response:', JSON.stringify(data, null, 2));
```

### On Frontend
Edit `client/js/dashboard.js`:
```javascript
// In getAICoachingSuggestion function:
console.log('AI Response:', data);
```

Then restart and check console.

---

## Contact Support

If still not working:
1. Share server logs (copy all terminal output)
2. Share browser console errors (F12 → Console tab)
3. Confirm all .env variables are set
4. Restart server after any .env changes
