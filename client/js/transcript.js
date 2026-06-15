// js/transcript.js – Manages live transcript rendering

const Transcript = (() => {
  let messages  = [];
  let count     = 0;
  const box     = () => document.getElementById('transcriptBox');
  const countEl = () => document.getElementById('transcriptCount');
  const typingRow = () => document.getElementById('typingRow');

  function _clearEmptyState() {
    const empty = box().querySelector('.empty-state');
    if (empty) empty.remove();
  }

  function add(who, text, highlight = false) {
    _clearEmptyState();
    count++;

    const msg = { who, text, ts: Date.now() };
    messages.push(msg);

    const div  = document.createElement('div');
    div.className = 'msg ' + who + (highlight ? ' highlight' : '');

    const label = document.createElement('div');
    label.className = 'msg-label';
    label.textContent = who === 'prospect' ? 'Prospect' : 'You (Sales Rep)';

    const content = document.createElement('div');
    content.textContent = text;

    div.appendChild(label);
    div.appendChild(content);
    box().appendChild(div);
    box().scrollTop = box().scrollHeight;

    if (countEl()) countEl().textContent = count + ' message' + (count !== 1 ? 's' : '');

    return msg;
  }

  function showTyping(show) {
    if (typingRow()) typingRow().style.display = show ? 'flex' : 'none';
  }

  function clear() {
    messages = [];
    count    = 0;
    box().innerHTML = '<div class="empty-state"><p>Transcript cleared.</p></div>';
    if (countEl()) countEl().textContent = '0 messages';
  }

  function getAll() { return messages; }

  return { add, clear, showTyping, getAll };
})();