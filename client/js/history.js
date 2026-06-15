// js/history.js – Call history page logic

(function () {
  // Seed dummy data if nothing saved yet
  const DUMMY = [
    { id: 'c1', date: '2025-04-18T14:30:00Z', prospect: 'Sarah Chen – Acme Corp',    duration: 1340, messages: 18, conf: '94%' },
    { id: 'c2', date: '2025-04-17T10:15:00Z', prospect: 'Mark Rivera – Globex',       duration: 870,  messages: 12, conf: '88%' },
    { id: 'c3', date: '2025-04-16T16:00:00Z', prospect: 'Priya Nair – TechStart',     duration: 1560, messages: 24, conf: '97%' },
    { id: 'c4', date: '2025-04-15T09:45:00Z', prospect: 'James Lee – NovaTech',       duration: 690,  messages: 10, conf: '82%' },
    { id: 'c5', date: '2025-04-14T11:20:00Z', prospect: 'Amara Osei – BlueWave',      duration: 1120, messages: 16, conf: '91%' },
    { id: 'c6', date: '2025-04-13T15:10:00Z', prospect: 'Carlos Ruiz – ZenCo',        duration: 960,  messages: 14, conf: '78%' },
  ];

  let sessions = JSON.parse(localStorage.getItem('caretta_sessions') || '[]');
  if (sessions.length === 0) {
    sessions = DUMMY;
    localStorage.setItem('caretta_sessions', JSON.stringify(sessions));
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
      + ' ' + d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  }

  function formatDur(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + 'm ' + String(s).padStart(2,'0') + 's';
  }

  function confClass(conf) {
    const n = parseInt(conf);
    return n >= 90 ? 'high' : n >= 80 ? 'medium' : 'low';
  }

  function render(list) {
    const tbody = document.getElementById('callsBody');
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#9ca3af;padding:32px;">No calls found.</td></tr>';
      return;
    }
    tbody.innerHTML = list.map(s => `
      <tr>
        <td>${formatDate(s.date)}</td>
        <td>${s.prospect}</td>
        <td>${formatDur(s.duration)}</td>
        <td>${s.messages}</td>
        <td><span class="score-pill ${confClass(s.conf)}">${s.conf}</span></td>
        <td><button class="btn-view" onclick="alert('Full transcript viewer coming soon!')">View</button></td>
      </tr>
    `).join('');
  }

  render(sessions);

  // Search
  document.getElementById('searchInput').addEventListener('input', function () {
    const q = this.value.toLowerCase();
    render(sessions.filter(s => s.prospect.toLowerCase().includes(q) || formatDate(s.date).toLowerCase().includes(q)));
  });

})();