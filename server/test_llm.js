require('dotenv').config();
const { getAISuggestion } = require('./src/services/llmService');

async function test() {
  const result = await getAISuggestion('test-session', 'Before we move forward, I need to understand your data encryption. Are we talking AES-256? TLS in transit? Our compliance team will definitely ask.');
  console.log("Result:", result);
}
test();
