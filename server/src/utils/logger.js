// server/utils/logger.js – Simple logger utility

const LOG_LEVELS = { info: '✅', warn: '⚠️ ', error: '❌', debug: '🔍' };

function log(level, message, meta = {}) {
  const ts    = new Date().toISOString();
  const icon  = LOG_LEVELS[level] || 'ℹ️';
  const metaStr = Object.keys(meta).length ? ' | ' + JSON.stringify(meta) : '';
  console.log(`${icon} [${ts}] [${level.toUpperCase()}] ${message}${metaStr}`);
}

const logger = {
  info : (msg, meta) => log('info',  msg, meta),
  warn : (msg, meta) => log('warn',  msg, meta),
  error: (msg, meta) => log('error', msg, meta),
  debug: (msg, meta) => { if (process.env.NODE_ENV !== 'production') log('debug', msg, meta); },
};

module.exports = logger;