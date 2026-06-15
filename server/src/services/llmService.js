// server/services/llmService.js – AI answer generation via Google Gemini
console.log("GEMINI KEY:", process.env.GEMINI_API_KEY);
const { searchKnowledgeBase } = require("./ragService");

const SYSTEM_PROMPT = `You are Caretta, a real-time AI sales coach.

Your job:
- Help salespeople respond to prospect objections or technical questions.
- If the input is NOT a real question (greetings, small talk, unclear text), do NOT respond with coaching.

STRICT RULES:
1. If message is greeting / casual / unclear → return ONLY:
   {"isQuestion":false}

2. Only if it is a technical question or sales objection, return ONLY this JSON (no markdown, no extra text):

{
  "isQuestion": true,
  "tag": "tech" | "obj" | "danger" | "tip",
  "tagLabel": "Technical" | "Objection" | "Competitive" | "Tip",
  "answer": "short, clear answer for salesperson to say",
  "note": "Tip: short coaching advice",
  "followups": ["question 1", "question 2", "question 3"],
  "confidence": 0-100,
  "docRef": "relevant doc name or empty string"
}

IMPORTANT:
- NEVER invent answers for greetings.
- NEVER include markdown or code fences.
- OUTPUT ONLY valid JSON.`;


// Improved intent filter — only block if message is ONLY casual/greeting
function isNonQuestion(text) {
  if (!text) return true;

  const t = text.toLowerCase().trim();

  // If it contains a question mark, it's likely a question
  if (t.includes("?")) return false;

  // If it contains technical keywords, don't block it
  const techKeywords = [
    "uptime", "sla", "downtime", "api", "integration", "security",
    "compliance", "gdpr", "soc2", "iso", "latency", "performance",
    "scalability", "database", "backup", "recovery", "hosting",
    "cloud", "aws", "azure", "gcp", "encryption", "oauth", "jwt"
  ];

  if (techKeywords.some(k => t.includes(k))) return false;

  // Only greetings / short casual messages should be blocked
  const greetingRegex =
    /^(hi+|hello|hey|good\s*(morning|evening|afternoon)|thanks?|ok|okay|sure|great|awesome|cool|bye|goodbye|see\s*you)[\s!.]*$/;

  if (greetingRegex.test(t)) return true;

  // Very short messages that are not questions
  if (t.length < 4) return true;

  return false;
}


// Extract JSON safely from Gemini output
function extractJSON(rawText) {
  if (!rawText) return null;

  // Remove markdown fences if any
  let clean = rawText.replace(/```json\n?|```\n?/g, "").trim();

  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  const jsonOnly = clean.slice(start, end + 1);

  try {
    return JSON.parse(jsonOnly);
  } catch (err) {
    console.error("❌ JSON Parse Failed:", err.message);
    console.error("Raw JSON Attempt:", jsonOnly);
    return null;
  }
}


/**
 * AI coaching suggestion generator using Google Gemini
 */
async function getAISuggestion(sessionId, prospectText) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY missing in .env");
      return null;
    }

    // Block useless inputs BEFORE LLM call
    if (isNonQuestion(prospectText)) {
      console.log("⚠️ Blocked non-question input:", prospectText);
      return null;
    }

    // Retrieve knowledge base context
    const contextArray = await searchKnowledgeBase(prospectText);

    let contextBlock = "";
    if (contextArray && contextArray.length > 0) {
      contextBlock =
        "\n\nRelevant product knowledge:\n" +
        contextArray
          .filter(c => c && typeof c === "string" && c.length > 0)
          .slice(0, 3)
          .map((c, i) => `${i + 1}. ${c}`)
          .join("\n");
    }

    // Build prompt
    const fullPrompt = `${SYSTEM_PROMPT}${contextBlock}
    Prospect said: "${prospectText}"
    IMPORTANT: Return ONLY valid JSON. No markdown. No explanation.`;

    console.log("📤 Sending request to Gemini...");

    // Call Google Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
            topK: 40,
            topP: 0.95
          },

          
          
        })
      }
    );

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      console.error("❌ Gemini API Error Body:", errBody);

      throw new Error(errBody.error?.message || `Gemini API error ${response.status}`);
    }

    const data = await response.json();

    const raw =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!raw) {
      console.warn("⚠️ Empty response from Gemini");
      return null;
    }

    console.log("📥 Gemini raw output:", raw);

    const parsed = extractJSON(raw);

    if (!parsed) {
      console.error("❌ Could not extract valid JSON from Gemini response.");
      return null;
    }

    // Final safety check
    if (!parsed.isQuestion) {
      console.log("⚠️ Gemini marked as not a question.");
      return null;
    }

    // Validate required fields
    if (!parsed.answer || typeof parsed.answer !== "string") {
      console.warn("⚠️ Invalid suggestion format:", parsed);
      return null;
    }

    // Ensure followups always array
    if (!Array.isArray(parsed.followups)) {
      parsed.followups = [];
    }

    // Ensure confidence is a number
    if (typeof parsed.confidence !== "number") {
      parsed.confidence = 60;
    }

    return {
      ...parsed,
      sessionId,
      question: prospectText,
      ts: Date.now()
    };

  } catch (err) {
    console.error("❌ LLM error:", err.message);
    return null;
  }
}

module.exports = { getAISuggestion };