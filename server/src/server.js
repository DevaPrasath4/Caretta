// server/server.js – Entry point

require("dotenv").config();

const app = require("./app");
const http = require("http");
const { initSocket } = require("./config/socket");
const { seedKnowledgeBase } = require("./services/ragService");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Caretta server running on http://0.0.0.0:${PORT}`);
  // Seed the knowledge base with embeddings (runs only if DB is empty)
  setTimeout(() => seedKnowledgeBase(), 3000);
});