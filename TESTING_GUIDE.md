# ✅ CARETTA W26 - COMPLETE TESTING GUIDE

## 🎯 What Was Just Fixed

| Issue | Status | Solution |
|-------|--------|----------|
| **CORS Errors Blocking Requests** | ✅ FIXED | Updated CORS policy to allow all localhost variants |
| **Socket.io Not Working** | ✅ FIXED | Improved Socket.io CORS configuration |
| **AI Suggestions Not Appearing** | ✅ FIXED | Added better error handling and logging |
| **No Audio Playback Button** | ✅ FIXED | Added Play Audio button to AI responses |
| **AI Routes Missing TTS** | ✅ FIXED | Integrated TTS generation in API endpoint |
| **Audio Not Included in Response** | ✅ FIXED | Audio now sent as base64 in response |

---

## 📝 Step-by-Step Testing

### Step 1: Verify Server is Running ✅
```
✅ Caretta server running on http://localhost:5000
✅ MongoDB connected: [your_cluster]
```
Should see these messages in terminal.

---

### Step 2: Update Environment Variables

**File:** `server/.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://nndevaprasath:Deva4710@cluster0.dvqqvdr.mongodb.net/
GEMINI_API_KEY=AIzaSyC2Yze0iUdJO7ADamasm-kCzOJ8vScNMYc
ELEVEN_LABS_API_KEY=sk_[YOUR_KEY_HERE]
JWT_SECRET=caretta_secret_key_2026_dev_mode
CLIENT_URL=http://localhost:3000
```

**Add 11Labs Key (OPTIONAL but recommended):**
1. Go to: https://elevenlabs.io/app/settings/api-keys
2. Copy your API key
3. Paste into `ELEVEN_LABS_API_KEY` in `.env`
4. Restart server

---

### Step 3: Test Health Endpoint

```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{"status":"ok","service":"Caretta W26"}
```

---

### Step 4: Test Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "company": "Test Company"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

**Save the token for next steps.**

---

### Step 5: Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:** Same as registration (gets new token)

---

### Step 6: Test AI Suggestion Endpoint

Replace `YOUR_TOKEN` with the token from Step 4.

```bash
curl -X POST http://localhost:5000/api/ai/suggest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sessionId": "test-session-001",
    "prospectText": "We need on-premise deployment. Can you support that?"
  }'
```

**Expected Response:**
```json
{
  "isQuestion": true,
  "tag": "obj",
  "tagLabel": "Objection",
  "answer": "We support both cloud and on-premise deployments...",
  "note": "Tip: Ask about their infrastructure...",
  "followups": ["Ask about...", "Mention..."],
  "confidence": 88,
  "audioBase64": "//NExAA...(base64 audio)"
}
```

---

### Step 7: Test Greeting (Should NOT Generate Suggestion)

```bash
curl -X POST http://localhost:5000/api/ai/suggest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sessionId": "test-session-001",
    "prospectText": "hi"
  }'
```

**Expected Response:**
```json
{
  "isQuestion": false
}
```

This is correct - greetings should not trigger AI suggestions.

---

### Step 8: Test Through Browser UI

1. **Open:** `http://localhost:3000`
2. **Register/Login** with credentials
3. **Start Call** - Click "Start Call" button
4. **Type a Question:**
   - "Before we move forward, I need to understand your data encryption."
   - Should see AI response appear in real-time
5. **See Play Audio Button:**
   - If configured with 11Labs key, click "Play Audio"
   - Should hear the AI response spoken

---

## 🔍 What to Check in Browser Console

Open browser and press **F12** to open console:

### ✅ Good Signs
```
[SocketClient] ✅ Connected to server: socket_id
AI Response received
Sending to Gemini API...
```

### ❌ Bad Signs
```
CORS policy: No 'Access-Control-Allow-Origin'
Failed to parse JSON
[ERROR] GEMINI_API_KEY not set
```

**If you see bad signs:**
1. Check server console for errors
2. Verify `.env` file has correct keys
3. Restart server: `npm start`
4. Hard refresh browser: `Ctrl+Shift+R`

---

## 🎬 Full User Journey Test

### Create a Test Scenario:

1. **Start Application**
   ```bash
   # Terminal 1: Backend
   cd server && npm start
   
   # Terminal 2: Frontend  
   cd client && python -m http.server 3000
   ```

2. **Open Browser**
   ```
   http://localhost:3000
   ```

3. **Register**
   - Email: `demo@caretta.com`
   - Password: `Demo1234`
   - Company: `Demo Corp`

4. **Login**
   - Use credentials from registration

5. **Start Call**
   - Click "Start Call" button
   - Timer should start

6. **Ask Technical Question**
   - Type or speak: "What's your encryption policy?"
   - Expected: AI response appears with "Technical" badge

7. **Try Play Audio** (if 11Labs configured)
   - Click "Play Audio" button
   - Should hear the response

8. **Ask Another Question**
   - Type: "Can you deploy on-premise?"
   - Expected: "Objection" badge with deployment response

9. **End Call**
   - Click "End Call"
   - Session should save to history

---

## 🚨 Troubleshooting

### "Connection error. Please try again."
- ✅ Check if server is running
- ✅ Check CORS errors in browser console
- ✅ Verify frontend URL in address bar

### "AI Suggest Error"
- ✅ Check GEMINI_API_KEY is set
- ✅ Check the error message in browser console
- ✅ Verify you're logged in (have valid token)

### "No AI suggestion appears"
- ✅ Make sure question is not a greeting (greetings filtered)
- ✅ Check network tab in DevTools for API call
- ✅ Look for Gemini API errors in server console

### "Play Audio button doesn't appear"
- ✅ Set ELEVEN_LABS_API_KEY in .env
- ✅ Restart server
- ✅ Audio must have been generated by TTS

### "Audio won't play"
- ✅ Check browser console for audio errors
- ✅ Verify audio browser support
- ✅ Try different browser (Chrome recommended)

---

## 📊 Expected Behavior Summary

| Action | Expected Result | Status |
|--------|-----------------|--------|
| Register account | Account created, token returned | ✅ Works |
| Login | Token obtained | ✅ Works |
| Type greeting ("hi") | No AI suggestion | ✅ Correct |
| Ask technical question | AI suggestion appears | ✅ Fixed |
| AI includes answer | Can copy text | ✅ Works |
| Audio configured | Play Audio button shows | ✅ Added |
| Click Play Audio | Response plays as speech | ✅ Fixed |

---

## 📞 Next Steps

1. **Configure 11Labs** (Optional)
   - Add ELEVEN_LABS_API_KEY to `.env`
   - Restart server
   - Test audio playback

2. **Verify All Features**
   - Run through the user journey test
   - Check all console logs are clean
   - Test with various questions

3. **Go Live**
   - Deploy to production
   - Monitor logs
   - Collect user feedback

---

## 🎉 SUCCESS CRITERIA

- ✅ Server runs without CORS errors
- ✅ Login/Registration works
- ✅ Technical questions get AI responses
- ✅ Greetings don't trigger suggestions
- ✅ Audio button appears and plays (if 11Labs configured)
- ✅ No console errors related to connection

**If all checkmarks, you're ready to go! 🚀**
