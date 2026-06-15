// server/services/ttsService.js – Text-to-speech using 11Labs API

const https = require('https');

/**
 * Convert text to speech using 11Labs API
 * @param {string} text - The text to convert to speech
 * @param {string} voiceId - The 11Labs voice ID (default: "JBFqnCBsd6RMkjVY3eQN")
 * @returns {Promise<Buffer>} - Audio buffer in MP3 format
 */
async function textToSpeech(text, voiceId = 'JBFqnCBsd6RMkjVY3eQN') {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  if (!process.env.ELEVEN_LABS_API_KEY) {
    throw new Error('ELEVEN_LABS_API_KEY not set in environment variables');
  }

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.elevenlabs.io',
      port: 443,
      path: `/v1/text-to-speech/${voiceId}`,
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVEN_LABS_API_KEY,
      },
    };

    const payload = JSON.stringify({
      text: text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    });

    const req = https.request(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        if (res.statusCode >= 400) {
          const errorData = Buffer.concat(chunks).toString('utf-8');
          reject(new Error(`11Labs API error ${res.statusCode}: ${errorData}`));
        } else {
          resolve(Buffer.concat(chunks));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Get available 11Labs voices
 * @returns {Promise<Array>} - List of available voices
 */
async function getAvailableVoices() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.elevenlabs.io',
      port: 443,
      path: '/v1/voices',
      method: 'GET',
      headers: {
        'xi-api-key': process.env.ELEVEN_LABS_API_KEY,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`11Labs API error ${res.statusCode}: ${data}`));
        } else {
          try {
            resolve(JSON.parse(data).voices);
          } catch (err) {
            reject(err);
          }
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

module.exports = { textToSpeech, getAvailableVoices };
