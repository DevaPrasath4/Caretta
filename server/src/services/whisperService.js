// server/config/socket.js – Socket.io setup with Room-based Prospect/Salesperson mode

const { Server } = require('socket.io');
const { transcribeAudioChunk } = require('../services/whisperService'); // now Gemini STT
const { getAISuggestion }      = require('../services/llmService');
const { logTranscript }        = require('../services/ragService');
const { textToSpeech }         = require('../services/ttsService');     // ElevenLabs TTS

let io;

// Track active sessions: sessionId -> { hostSocketId, prospectSocketId }
const sessions = {};

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // HOST (Salesperson) starts a call
    socket.on('call:start', (data) => {
      const { sessionId } = data;
      socket.join(sessionId);
      sessions[sessionId] = { hostSocketId: socket.id, prospectSocketId: null };
      console.log(`📞 Host started session: ${sessionId}`);
      socket.emit('call:started', { sessionId });
    });

    // PROSPECT joins via session link
    socket.on('prospect:join', (data) => {
      const { sessionId } = data;
      if (!sessions[sessionId]) {
        socket.emit('error', { message: 'Session not found. Ask the salesperson for the correct session ID.' });
        return;
      }
      socket.join(sessionId);
      sessions[sessionId].prospectSocketId = socket.id;
      console.log(`👤 Prospect joined session: ${sessionId}`);
      socket.emit('prospect:joined', { sessionId });
      // Notify host that prospect connected
      io.to(sessions[sessionId].hostSocketId).emit('prospect:connected', { sessionId });
    });

    // PROSPECT sends a typed question
    socket.on('prospect:question', async (data) => {
      const { sessionId, text } = data;
      if (!sessions[sessionId]) return;

      console.log(`❓ Prospect question [${sessionId}]: ${text}`);

      // 1. Show question on host's screen immediately
      io.to(sessions[sessionId].hostSocketId).emit('transcript:chunk', {
        who: 'prospect',
        text,
        ts: Date.now()
      });

      // 2. Emit "AI thinking" indicator to host
      io.to(sessions[sessionId].hostSocketId).emit('ai:thinking', true);

      // 3. Get AI suggestion
      try {
        const suggestion = await getAISuggestion(sessionId, text);
        io.to(sessions[sessionId].hostSocketId).emit('ai:thinking', false);

        if (suggestion) {
          io.to(sessions[sessionId].hostSocketId).emit('ai:suggestion', suggestion);
          await logTranscript(sessionId, text, suggestion);
        }
      } catch (err) {
        io.to(sessions[sessionId].hostSocketId).emit('ai:thinking', false);
        console.error('AI error:', err.message);
      }
    });

    // GUEST sends a question (Q&A mode - not in call)
    socket.on('guest:question', async (data) => {
      const { sessionId, text } = data;
      if (!sessions[sessionId]) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      console.log(`❓ Guest question [${sessionId}]: ${text}`);

      // Detect if it's a simple greeting or technical question
      const isTechnical = detectTechnicalQuestion(text);

      // Send question to host
      io.to(sessions[sessionId].hostSocketId).emit('guest:question', {
        text,
        isTechnical,
        ts: Date.now()
      });

      if (isTechnical) {
        // AI auto-responds for technical questions
        socket.emit('ai:thinking', true);
        try {
          const response = await getAISuggestion(sessionId, text);
          socket.emit('ai:thinking', false);
          socket.emit('host:response', { text: response, isAI: true });
          // Also send to host
          io.to(sessions[sessionId].hostSocketId).emit('guest:response', {
            text: response,
            isAI: true,
            originalQuestion: text
          });
        } catch (err) {
          socket.emit('ai:thinking', false);
          // Let host handle it
          io.to(sessions[sessionId].hostSocketId).emit('guest:needsResponse', {
            text,
            ts: Date.now()
          });
        }
      } else {
        // Non-technical - let host answer manually
        io.to(sessions[sessionId].hostSocketId).emit('guest:needsResponse', {
          text,
          ts: Date.now()
        });
      }
    });

    // HOST sends a manual reply to the prospect (shown on prospect page)
    socket.on('host:reply', (data) => {
      const { sessionId, text } = data;
      console.log(`💬 host:reply received [${sessionId}]: "${text}"`);
      if (!sessions[sessionId]) {
        console.log(`❌ Session not found: ${sessionId}`);
        return;
      }
      if (!sessions[sessionId].prospectSocketId) {
        console.log(`❌ No prospect connected for session: ${sessionId}`);
        return;
      }
      console.log(`✅ Forwarding reply to prospect socket: ${sessions[sessionId].prospectSocketId}`);
      io.to(sessions[sessionId].prospectSocketId).emit('host:reply', { text, ts: Date.now() });
    });

    // HOST sends manual response to guest
    socket.on('host:response', (data) => {
      const { sessionId, text, originalQuestion } = data;
      if (!sessions[sessionId]) return;

      // Send response to guest
      io.to(sessions[sessionId].prospectSocketId).emit('host:response', {
        text,
        isAI: false
      });
    });

    // Helper: Detect if question is technical
    function detectTechnicalQuestion(text) {
      const lower = text.toLowerCase();
      const simpleGreetings = [
        'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
        'how are you', 'what is your name', 'who are you', 'thanks', 'thank you'
      ];
      
      // Check if it's a simple greeting
      for (const greeting of simpleGreetings) {
        if (lower.includes(greeting)) return false;
      }
      
      // Check for technical keywords
      const technicalKeywords = [
        'price', 'cost', 'pricing', 'plan', 'features', 'integration', 'api',
        'security', 'encryption', 'data', 'privacy', 'compliance', 'gdpr',
        'setup', 'install', 'configuration', 'customize', 'demo', 'trial',
        'enterprise', 'team', 'users', 'limit', 'storage', 'bandwidth',
        'support', 'documentation', 'training', 'update', 'upgrade',
        'mobile', 'ios', 'android', 'windows', 'mac', 'linux',
        'cloud', 'on-premise', 'hosting', 'server', 'database',
        'automation', 'workflow', 'analytics', 'reporting', 'dashboard',
        'sso', 'oauth', 'saml', 'webhook', 'rest', 'json', 'xml'
      ];

      for (const keyword of technicalKeywords) {
        if (lower.includes(keyword)) return true;
      }

      // If it's a question mark with substantial text, likely technical
      if (text.includes('?') && text.length > 20) return true;

      // Default to technical (AI will answer)
      return true;
    }

    // HOST sends audio chunk (voice flow) — transcribed by Gemini STT
    socket.on('audio:chunk', async (data) => {
      try {
        const { sessionId, audioBuffer, mimeType = 'audio/webm' } = data;

        // Transcribe via Gemini STT (replaces Whisper)
        const text = await transcribeAudioChunk(
          Buffer.isBuffer(audioBuffer) ? audioBuffer : Buffer.from(audioBuffer),
          mimeType
        );
        if (!text) return;

        socket.emit('transcript:chunk', { who: 'rep', text, ts: Date.now() });

        const suggestion = await getAISuggestion(sessionId, text);
        if (suggestion) {
          socket.emit('ai:suggestion', suggestion);
          await logTranscript(sessionId, text, suggestion);

          // Optional: speak the AI answer aloud via ElevenLabs TTS
          if (process.env.ELEVEN_LABS_API_KEY && suggestion.answer) {
            try {
              const audioData = await textToSpeech(suggestion.answer);
              socket.emit('ai:audio', {
                audio: audioData.toString('base64'),
                mimeType: 'audio/mpeg'
              });
            } catch (ttsErr) {
              console.warn('⚠️ TTS skipped:', ttsErr.message);
            }
          }
        }
      } catch (err) {
        console.error('Socket audio:chunk error:', err.message);
        socket.emit('error', { message: 'Audio processing error.' });
      }
    });

    // End call
    socket.on('call:end', (data) => {
      const { sessionId } = data;
      console.log(`📴 Call ended: ${sessionId}`);
      io.to(sessionId).emit('call:ended', { sessionId });
      socket.leave(sessionId);
      delete sessions[sessionId];
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      for (const [sessionId, session] of Object.entries(sessions)) {
        if (session.prospectSocketId === socket.id) {
          io.to(session.hostSocketId).emit('prospect:disconnected', { sessionId });
          sessions[sessionId].prospectSocketId = null;
        }
      }
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

module.exports = { initSocket, getIO };