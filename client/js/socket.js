// client/js/socket.js – Socket.io client wrapper (updated for room-based flow)

const SocketClient = (() => {
  let socket = null;
  let currentSessionId = null;

  function connect(sessionId) {
    currentSessionId = sessionId;
    const SERVER_URL = window.CARETTA_SERVER || `http://${window.location.hostname}:5000`;
    socket = io(SERVER_URL);

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      socket.emit('call:start', { sessionId });
    });

    socket.on('call:started', (data) => {
      console.log('📞 Call session started:', data.sessionId);
      // Show the session link / ID so salesperson can share it
      if (typeof onCallStarted === 'function') onCallStarted(data.sessionId);
    });

    socket.on('prospect:connected', () => {
      console.log('👤 Prospect joined the session');
      if (typeof onProspectConnected === 'function') onProspectConnected();
    });

    socket.on('prospect:disconnected', () => {
      console.log('👤 Prospect left the session');
      if (typeof onProspectDisconnected === 'function') onProspectDisconnected();
    });

    socket.on('transcript:chunk', (data) => {
      Transcript.add(data.who, data.text, data.who === 'prospect');
    });

    socket.on('ai:thinking', (isThinking) => {
      Transcript.showTyping(isThinking);
      if (isThinking) {
        document.getElementById('aiContent').innerHTML = `
          <div class="ai-thinking">
            <span class="thinking-dot"></span>
            <span class="thinking-dot"></span>
            <span class="thinking-dot"></span>
            <span style="margin-left:8px;color:var(--text-muted);font-size:13px;">AI is generating a response...</span>
          </div>`;
      }
    });

    socket.on('ai:suggestion', (suggestion) => {
      AICoach.renderLive(suggestion);
    });

    // Guest question events (Q&A mode)
    socket.on('host:response', (data) => {
      if (typeof onHostResponse === 'function') onHostResponse(data);
    });
    socket.on('guest:question', (data) => {
      console.log('❓ Guest question received:', data);
      if (typeof onGuestQuestion === 'function') {
        onGuestQuestion(data);
      }
    });

    socket.on('guest:needsResponse', (data) => {
      console.log('⚠️ Guest needs manual response:', data);
      if (typeof onGuestNeedsResponse === 'function') {
        onGuestNeedsResponse(data);
      }
    });

    socket.on('guest:response', (data) => {
      console.log('💬 Guest received response:', data);
      if (typeof onGuestResponse === 'function') {
        onGuestResponse(data);
      }
    });

    socket.on('call:ended', () => {
      console.log('📴 Call ended by server');
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err.message);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });
  }

  function disconnect() {
    if (socket && currentSessionId) {
      socket.emit('call:end', { sessionId: currentSessionId });
      socket.disconnect();
      socket = null;
      currentSessionId = null;
    }
  }

  function getSessionId() {
    return currentSessionId;
  }

  function getSocket() {
    return socket;
  }

  return { connect, disconnect, getSessionId, getSocket };
})();
