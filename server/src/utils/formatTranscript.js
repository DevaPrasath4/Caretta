// server/utils/formatTranscript.js – Transcript formatting helpers

/**
 * Formats an array of transcript messages into a readable plain-text string.
 * Useful for post-call summaries or exporting.
 */
function toPlainText(messages) {
  return messages.map(m => {
    const who = m.who === 'prospect' ? 'Prospect' : 'Sales Rep';
    const ts  = new Date(m.ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return `[${ts}] ${who}: ${m.text}`;
  }).join('\n');
}

/**
 * Extracts only the flagged (technical question) lines from a transcript.
 */
function extractFlagged(messages) {
  return messages.filter(m => m.flagged);
}

/**
 * Groups transcript messages into turns (consecutive blocks from same speaker).
 */
function groupByTurns(messages) {
  const turns = [];
  messages.forEach(m => {
    const last = turns[turns.length - 1];
    if (last && last.who === m.who) {
      last.text += ' ' + m.text;
    } else {
      turns.push({ who: m.who, text: m.text, ts: m.ts });
    }
  });
  return turns;
}

module.exports = { toPlainText, extractFlagged, groupByTurns };