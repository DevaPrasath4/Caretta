# Client-Server Connection Setup

## ✅ Changes Made

### 1. **WebSocket Connection Enabled** (`client/js/socket.js`)
- Uncommented real WebSocket connection to `ws://localhost:5000`
- Added proper error handling and connection status logging
- Connection now properly emits `connected`, `disconnected`, and `error` events

### 2. **API Authentication Enabled** (`client/js/login.js`)
- Replaced demo mode with real API call to `http://localhost:5000/api/auth/login`
- Added proper error handling for failed login attempts
- Now stores auth token and user data from server response

### 3. **Environment Configuration** (`server/.env`)
- ✅ Added `JWT_SECRET=caretta_secret_key_2026_dev_mode`
- ✅ Added `CLIENT_URL=http://localhost:3000`
- ✅ Port: 5000 (Server)
- ✅ MongoDB URI configured
- ✅ OpenAI API Key configured

### 4. **Login Page Updated** (`client/index.html`)
- Updated demo note to reflect real authentication requirement

---

## 🚀 How to Start

### **Terminal 1: Start the Server**
```powershell
cd server
npm install
npm start
```
Expected output:
```
✅ Caretta server running on http://localhost:5000
✅ MongoDB connected: cluster0.dvqqvdr.mongodb.net
```

### **Terminal 2: Serve the Client**
You have two options:

#### Option A: Use Python's HTTP Server (Recommended for Quick Testing)
```powershell
cd client
python -m http.server 3000
```

#### Option B: Use Node.js HTTP Server
```powershell
cd client
npx http-server -p 3000
```

#### Option C: Use Live Server Extension (VS Code)
- Right-click `client/index.html` → "Open with Live Server"
- Ensure it's running on port 3000

---

## 🧪 Testing the Connection

### **1. Test Server Health**
```powershell
curl http://localhost:5000/api/health
```
Expected response:
```json
{"status": "ok", "service": "Caretta W26"}
```

### **2. Register a New Account**
```powershell
curl -X POST http://localhost:5000/api/auth/register `
-H "Content-Type: application/json" `
-d '{
  "name": "Test User",
  "email": "test@example.com", 
  "password": "password123",
  "company": "Test Company"
}'
```

### **3. Login with Credentials**
```powershell
curl -X POST http://localhost:5000/api/auth/login `
-H "Content-Type: application/json" `
-d '{
  "email": "test@example.com",
  "password": "password123"
}'
```
Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

### **4. Test in Browser**
1. Navigate to `http://localhost:3000`
2. Register or login with the credentials you just created
3. You should see the dashboard with a "Live call" status
4. Open browser DevTools (F12) → Console tab
5. You should see:
   - `[SocketClient] ✅ Connected to server`
   - Socket connection established messages

---

## 🔍 Troubleshooting

### **WebSocket Connection Fails**
- ✅ Ensure server is running on port 5000
- ✅ Check browser console for error messages
- ✅ Verify CORS is allowing `http://localhost:3000`

### **Login Failed: 404**
- ✅ Make sure server is running
- ✅ Check that `http://localhost:5000` is accessible
- ✅ Try the health check endpoint first

### **MongoDB Connection Error**
- ✅ Verify MongoDB URI in `.env` is correct
- ✅ Check internet connection for MongoDB Atlas access
- ✅ Verify IP whitelist in MongoDB Atlas includes your IP

### **Port Already in Use**
- Change port in `.env` (SERVER): `PORT=5001`
- Change client connection to match: `ws://localhost:5001`
- Change client login API to match: `http://localhost:5001/api/auth/login`

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────┐
│         Client (Port 3000)              │
│  ┌──────────────────────────────────┐   │
│  │  HTML/CSS/JS (login, dashboard)  │   │
│  └──────────────────────────────────┘   │
│              ↓ ↑                        │
│     HTTP REST API + WebSocket           │
│              ↓ ↑                        │
└──────────────────────────────────────────┘
              ↓ ↑
       ┌──────────────┐
       │ API Routes   │
       │ - Auth       │
       │ - Calls      │
       │ - AI         │
       │ - Transcripts│
       └──────────────┘
              ↓ ↑
┌─────────────────────────────────────────┐
│         Server (Port 5000)              │
│  ┌──────────────────────────────────┐   │
│  │  Express.js + Socket.io          │   │
│  │  - Authentication                │   │
│  │  - Real-time events              │   │
│  │  - AI coaching suggestions       │   │
│  │  - Transcripts management        │   │
│  └──────────────────────────────────┘   │
│              ↓ ↑                        │
│    MongoDB Connection                   │
│              ↓ ↑                        │
└──────────────────────────────────────────┘
```

---

## ✨ Next Steps

1. ✅ Start both servers (follow instructions above)
2. ✅ Test the endpoints in Postman or curl
3. ✅ Access the client in browser and login
4. ✅ Verify WebSocket connection in console
5. 🔄 Ready to test AI coaching features!
