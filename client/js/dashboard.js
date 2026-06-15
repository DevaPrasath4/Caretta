// js/dashboard.js – Updated: room-based flow, session share, live AI from server

(function () {
  // Auth guard
  const user = JSON.parse(localStorage.getItem('caretta_user') || 'null');
  if (!user) { window.location.href = '../index.html'; return; }

  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  document.getElementById('userAvatar').textContent = initials;

  // State
  let callActive  = false;
  let micActive   = false;
  let timerHandle = null;
  let seconds     = 0;
  let busy        = false;
  let currentSessionId = null;

  // Elements
  const startBtn    = document.getElementById('startCallBtn');
  const endBtn      = document.getElementById('endCallBtn');
  const micBtn      = document.getElementById('micBtn');
  const micLabel    = document.getElementById('micLabel');
  const timerEl     = document.getElementById('callTimer');
  const statusDot   = document.getElementById('statusDot');
  const statusLabel = document.getElementById('statusLabel');
  const callInfo    = document.getElementById('callInfo');
  const clearBtn    = document.getElementById('clearBtn');
  const simBtns     = document.querySelectorAll('.sim-btn');
  const logoutBtn   = document.getElementById('logoutBtn');
  const sessionBox  = document.getElementById('sessionShareBox');
  const sessionIdEl = document.getElementById('sessionIdDisplay');
  const sessionLink = document.getElementById('sessionLinkDisplay');
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  const prospectStatusEl = document.getElementById('prospectStatus');

  function pad(n) { return String(n).padStart(2, '0'); }

  function setStatus(state) {
    statusDot.className = 'dot ' + state;
    const labels = { idle: 'Ready', live: 'Live call', ended: 'Call ended' };
    statusLabel.textContent = labels[state] || state;
  }

  function startTimer() {
    seconds = 0;
    timerEl.textContent = '00:00';
    timerHandle = setInterval(() => {
      seconds++;
      timerEl.textContent = pad(Math.floor(seconds / 60)) + ':' + pad(seconds % 60);
    }, 1000);
  }

  function stopTimer() { clearInterval(timerHandle); }

  // Socket callbacks (called by socket.js)
  window.onCallStarted = function(sessionId) {
    currentSessionId = sessionId;
    const SERVER_URL = window.CARETTA_SERVER || `http://${window.location.hostname}:5000`;
    const link = `${window.location.origin}/pages/prospect.html?session=${sessionId}`;
    sessionIdEl.textContent = sessionId;
    sessionLink.value = link;
    sessionBox.style.display = 'block';
    prospectStatusEl.textContent = '⏳ Waiting for prospect...';
    prospectStatusEl.style.color = 'var(--text-muted)';
  };

  window.onProspectConnected = function() {
    prospectStatusEl.textContent = '🟢 Prospect connected';
    prospectStatusEl.style.color = 'var(--green, #10b981)';
    Transcript.add('rep', '📲 Prospect joined the session. Questions will appear here.');
  };

  window.onProspectDisconnected = function() {
    prospectStatusEl.textContent = '🔴 Prospect disconnected';
    prospectStatusEl.style.color = '#ef4444';
  };

  // Q&A Panel - Guest question received
  window.onGuestQuestion = function(data) {
    const qaCard = document.getElementById('qaCard');
    const qaList = document.getElementById('qaList');
    const qaBadge = document.getElementById('qaBadge');
    
    qaCard.style.display = 'block';
    qaBadge.style.display = 'inline';
    
    // Add question to list
    const emptyEl = qaList.querySelector('.qa-empty');
    if (emptyEl) emptyEl.remove();
    
    const qaItem = document.createElement('div');
    qaItem.className = 'qa-item ' + (data.isTechnical ? 'ai-answered' : 'needs-response');
    qaItem.innerHTML = `
      <div class="question-text">${data.text}</div>
      <div class="question-meta">${data.isTechnical ? 'AI answered automatically' : 'Waiting for your response'}</div>
    `;
    qaList.insertBefore(qaItem, qaList.firstChild);
  };

  // Q&A Panel - Guest needs manual response
  window.onGuestNeedsResponse = function(data) {
    const qaCard = document.getElementById('qaCard');
    const qaList = document.getElementById('qaList');
    const responseForm = document.getElementById('qaResponseForm');
    const responseText = document.getElementById('qaResponseText');
    
    qaCard.style.display = 'block';
    
    // Add question to list
    const emptyEl = qaList.querySelector('.qa-empty');
    if (emptyEl) emptyEl.remove();
    
    const qaItem = document.createElement('div');
    qaItem.className = 'qa-item needs-response';
    qaItem.innerHTML = `
      <div class="question-text">${data.text}</div>
      <div class="question-meta">Waiting for your response</div>
    `;
    qaList.insertBefore(qaItem, qaList.firstChild);
    
    // Show response form
    responseForm.style.display = 'block';
    responseText.focus();
  };

  // Q&A Panel - AI auto-responded
  window.onGuestResponse = function(data) {
    const qaCard = document.getElementById('qaCard');
    const qaList = document.getElementById('qaList');
    const responseForm = document.getElementById('qaResponseForm');
    
    // Add AI response to list
    const emptyEl = qaList.querySelector('.qa-empty');
    if (emptyEl) emptyEl.remove();
    
    const qaItem = document.createElement('div');
    qaItem.className = 'qa-item ai-answered';
    qaItem.innerHTML = `
      <div class="question-text">${data.originalQuestion}</div>
      <div class="question-meta">🤖 AI Response: ${data.text}</div>
    `;
    qaList.insertBefore(qaItem, qaList.firstChild);
    
    // Hide response form
    responseForm.style.display = 'none';
  };

  // Send response to guest
  const sendResponseBtn = document.getElementById('sendResponseBtn');
  if (sendResponseBtn) {
    sendResponseBtn.addEventListener('click', () => {
      const responseText = document.getElementById('qaResponseText');
      const text = responseText.value.trim();
      if (!text) return;
      if (!currentSessionId) {
        alert("Please start a call first.");
        return;
      }
      
      // Use SocketClient to emit the response
      const socket = SocketClient.getSocket();
      if (socket) {
        socket.emit('host:response', {
          sessionId: currentSessionId,
          text: text
        });
      }
      
      responseText.value = '';
      document.getElementById('qaResponseForm').style.display = 'none';
    });
  }

  // ✅ REPLY BOX – Salesperson replies to prospect in real-time
  const replyInput   = document.getElementById('replyInput');
  const sendReplyBtn = document.getElementById('sendReplyBtn');

  function sendReply() {
    const text = replyInput ? replyInput.value.trim() : '';
    if (!text) return;
    if (!currentSessionId) {
      alert("Please start a call first to reply to the prospect.");
      return;
    }

    const socket = SocketClient.getSocket();
    if (socket) {
      // Emit to server → server forwards to prospect
      socket.emit('host:reply', { sessionId: currentSessionId, text });
    }

    // Show in own transcript immediately
    Transcript.add('rep', text, false);

    replyInput.value = '';
    replyInput.focus();
  }

  if (sendReplyBtn) {
    sendReplyBtn.addEventListener('click', sendReply);
  }
  if (replyInput) {
    replyInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendReply();
      }
    });
  }

  // Copy link button
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(sessionLink.value).then(() => {
        copyLinkBtn.textContent = '✓ Copied!';
        setTimeout(() => copyLinkBtn.textContent = 'Copy Link', 2000);
      });
    });
  }

  // Start call
  startBtn.addEventListener('click', () => {
    callActive = true;
    micActive  = true;

    startBtn.disabled = true;
    endBtn.disabled   = false;
    micBtn.disabled   = false;
    micBtn.classList.add('active');
    micLabel.textContent = 'Mic on';
    callInfo.style.display = 'flex';

    setStatus('live');
    startTimer();

    currentSessionId = 'session-' + Date.now();
    SocketClient.connect(currentSessionId);

    Transcript.add('rep', 'Hi! Thanks for joining today. Happy to walk you through everything.');
    simBtns.forEach(b => b.disabled = false);
  });

  // End call
  endBtn.addEventListener('click', () => {
    callActive  = false;
    micActive   = false;

    startBtn.disabled  = false;
    endBtn.disabled    = true;
    micBtn.disabled    = true;
    micBtn.classList.remove('active');
    micLabel.textContent   = 'Mic off';
    callInfo.style.display = 'none';
    if (sessionBox) sessionBox.style.display = 'none';

    setStatus('ended');
    stopTimer();
    SocketClient.disconnect();

    simBtns.forEach(b => b.disabled = true);
    Transcript.add('rep', '[Call ended]');

    const sessions = JSON.parse(localStorage.getItem('caretta_sessions') || '[]');
    sessions.unshift({
      id      : 'call-' + Date.now(),
      date    : new Date().toISOString(),
      duration: seconds,
      prospect: 'Demo Prospect',
      messages: Transcript.getAll().length,
      conf    : document.getElementById('metricConf').textContent
    });
    localStorage.setItem('caretta_sessions', JSON.stringify(sessions.slice(0, 50)));
  });

  // Mic toggle
  micBtn.addEventListener('click', () => {
    micActive = !micActive;
    micBtn.classList.toggle('active', micActive);
    micLabel.textContent = micActive ? 'Mic on' : 'Mic muted';
  });

  // Clear transcript
  clearBtn.addEventListener('click', () => Transcript.clear());

  // Simulate buttons (local demo mode — works without server)
  simBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (busy || !callActive) return;
      busy = true;
      simBtns.forEach(b => b.disabled = true);

      const key = btn.dataset.q;
      const scenario = AICoach.SCENARIOS[key];
      if (!scenario) { busy = false; return; }

      Transcript.showTyping(true);

      setTimeout(() => {
        Transcript.showTyping(false);
        Transcript.add('prospect', scenario.prospect, true);

        setTimeout(() => {
          AICoach.render(key);
          busy = false;
          simBtns.forEach(b => b.disabled = false);
        }, 700);
      }, 1200);
    });
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('caretta_user');
    window.location.href = '../index.html';
  });

})();