// server/services/coachingService.js – Post-processing coaching logic

/**
 * Enhances an AI suggestion with additional coaching signals:
 * - Tone guidance
 * - Objection severity scoring
 * - Upsell / cross-sell opportunity flags
 */
function enrichSuggestion(suggestion) {
  if (!suggestion) return suggestion;

  const { tag, confidence } = suggestion;

  let toneGuide = 'Be confident and concise.';
  if (tag === 'obj')    toneGuide = 'Acknowledge the concern empathetically, then pivot to value.';
  if (tag === 'danger') toneGuide = 'Stay calm. Focus on your unique strengths — avoid naming the competitor directly.';
  if (tag === 'tip')    toneGuide = 'Keep it friendly and helpful. Offer to provide documentation.';

  let urgency = 'low';
  if (confidence < 80) urgency = 'high';   // low confidence = high urgency to verify
  if (tag === 'danger') urgency = 'medium';

  return {
    ...suggestion,
    toneGuide,
    urgency,
    upsellFlag: tag === 'pricing' || tag === 'integration',
  };
}

/**
 * Generates a post-call summary with coaching insights.
 */
function generateCallSummary(suggestions) {
  const total     = suggestions.length;
  const avgConf   = total ? Math.round(suggestions.reduce((s, x) => s + x.confidence, 0) / total) : 0;
  const tagCounts = suggestions.reduce((acc, s) => { acc[s.tag] = (acc[s.tag] || 0) + 1; return acc; }, {});

  return {
    totalQuestions  : total,
    avgConfidence   : avgConf,
    tagBreakdown    : tagCounts,
    topChallenge    : Object.entries(tagCounts).sort((a,b) => b[1]-a[1])[0]?.[0] || 'none',
    recommendation  : avgConf >= 90
      ? 'Excellent call — AI handled most questions with high confidence.'
      : avgConf >= 75
      ? 'Good call — consider reviewing low-confidence answers after the call.'
      : 'Challenging call — add more product docs to the knowledge base to improve accuracy.',
  };
}

module.exports = { enrichSuggestion, generateCallSummary };