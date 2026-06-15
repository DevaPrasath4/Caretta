// js/ai-coach.js – AI coaching panel + scenario data

const AICoach = (() => {

  // ── Scenario knowledge base (replace with real RAG/LLM in production) ──
  const SCENARIOS = {
    encryption: {
      prospect : "Before we move forward, I need to understand your data encryption. Are we talking AES-256? TLS in transit? Our compliance team will definitely ask.",
      tag      : 'tech', tagLabel: 'Technical',
      answer   : "We use AES-256 encryption at rest and TLS 1.3 for all data in transit. Encryption keys are managed via AWS KMS with automatic 90-day rotation. We're SOC 2 Type II and ISO 27001 certified, so your compliance team should be fully satisfied.",
      note     : "Tip: Offer to send the security whitepaper to close the concern.",
      followups: ["Ask about their current security stack", "Offer the security whitepaper", "Mention SOC 2 audit report availability"],
      docRef   : "Security whitepaper.pdf",
      conf     : 94
    },
    deployment: {
      prospect : "We have strict data residency requirements. Can your product be deployed on-premise, or is it cloud only?",
      tag      : 'obj', tagLabel: 'Objection',
      answer   : "We support both cloud (AWS, GCP, Azure) and fully on-premise deployments via Docker and Kubernetes. For on-prem, your team manages the infrastructure and we provide complete setup documentation plus dedicated onboarding support at no extra cost.",
      note     : "Tip: Ask what their existing infrastructure looks like to recommend the best path.",
      followups: ["Ask about their infra team size", "Mention hybrid deployment option", "Offer a technical POC call"],
      docRef   : "Deployment FAQ.txt",
      conf     : 88
    },
    integration: {
      prospect : "Our entire sales workflow lives in Salesforce. Does your product integrate natively, or do we need custom development work?",
      tag      : 'tech', tagLabel: 'Integration',
      answer   : "We have a native Salesforce AppExchange integration — one-click install, no custom dev required. It syncs contacts, deals, and activity logs bi-directionally in real time. We also support HubSpot, Pipedrive, and Zoho out of the box.",
      note     : "Tip: Ask which Salesforce edition they're on to confirm all features apply to their tier.",
      followups: ["Ask their Salesforce edition", "Mention AppExchange listing", "Offer a live integration demo"],
      docRef   : "Integration guide.pdf",
      conf     : 97
    },
    pricing: {
      prospect : "We're a 200-person company. Can you walk me through your pricing model? Are there annual commitments or monthly options?",
      tag      : 'obj', tagLabel: 'Pricing',
      answer   : "We price per seat with volume discounts starting at 50+ users. We offer both monthly and annual plans — annual saves 20%. For a 200-person team we'd typically quote a custom enterprise contract with dedicated support and SLA guarantees included.",
      note     : "Tip: Pivot to value — mention ROI from faster deal closings before giving specific numbers.",
      followups: ["Ask how many seats they need", "Mention ROI case studies", "Offer a custom pricing proposal"],
      docRef   : "Product manual.pdf",
      conf     : 82
    },
    uptime: {
      prospect : "What's your uptime track record? Do you offer an SLA? We can't afford downtime in our sales process.",
      tag      : 'tech', tagLabel: 'Reliability',
      answer   : "We guarantee 99.9% uptime in our standard SLA, and 99.99% for enterprise plans. We've maintained 99.97% uptime over the last 12 months. In the event of an incident, we provide real-time status updates and credits for any downtime that exceeds the SLA threshold.",
      note     : "Tip: Share the status page URL and last incident report to build credibility.",
      followups: ["Share the status page link", "Mention incident response time", "Offer enterprise SLA terms"],
      docRef   : "Product manual.pdf",
      conf     : 91
    },
    competitor: {
      prospect : "We've also been looking at [Competitor]. How do you compare, especially on AI accuracy and speed?",
      tag      : 'danger', tagLabel: 'Competitive',
      answer   : "We outperform on real-time latency — our suggestions appear in under 800ms vs. the industry average of 2–3 seconds. Our RAG architecture means answers are grounded in your actual product docs, not generic AI guesses, which gives you far higher accuracy on technical questions.",
      note     : "Caution: Avoid naming the competitor directly. Focus on your unique value — speed + grounded accuracy.",
      followups: ["Ask what's most important to them: speed, accuracy, or integrations", "Offer a side-by-side demo", "Share a customer case study"],
      docRef   : "Product manual.pdf",
      conf     : 78
    }
  };

  let questionCount = 0;

  function _setMetrics(conf, type) {
    const confEl  = document.getElementById('metricConf');
    const fillEl  = document.getElementById('confFill');
    const typeEl  = document.getElementById('metricType');
    const qEl     = document.getElementById('metricQ');

    questionCount++;
    qEl.textContent   = questionCount;
    confEl.textContent = conf + '%';
    typeEl.textContent = type;

    fillEl.style.width      = conf + '%';
    fillEl.style.background =
      conf >= 90 ? 'var(--brand)' :
      conf >= 75 ? 'var(--warn)' : 'var(--danger)';
  }

  function render(key) {
    const s = SCENARIOS[key];
    if (!s) return;

    _setMetrics(s.conf, s.tagLabel);

    const badge = document.getElementById('aiBadge');
    badge.textContent  = s.tagLabel;
    badge.className    = 'ai-badge ' + s.tag;
    badge.style.display = 'inline-block';

    document.getElementById('aiContent').innerHTML = `
      <div class="ai-suggestion-label">Suggested response</div>
      <div class="ai-answer">${s.answer}</div>
      <div class="ai-note">${s.note}</div>
      <button class="copy-btn" id="copyBtn">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Copy response
      </button>
    `;

    document.getElementById('copyBtn').addEventListener('click', function () {
      navigator.clipboard.writeText(s.answer).catch(() => {});
      this.textContent = '✓ Copied!';
      this.classList.add('copied');
      setTimeout(() => {
        this.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy response`;
        this.classList.remove('copied');
      }, 2000);
    });

    // Follow-ups
    const ul = document.getElementById('followupList');
    ul.innerHTML = s.followups.map(f => `<li>${f}</li>`).join('');

    // Highlight matching doc
    document.querySelectorAll('.doc-item').forEach(el => {
      el.style.background = el.querySelector('span').textContent === s.docRef
        ? 'var(--brand-light)' : '';
    });
  }

  function reset() {
    document.getElementById('aiContent').innerHTML =
      '<div class="empty-state small"><p>AI suggestions appear when a technical question is detected.</p></div>';
    document.getElementById('aiBadge').style.display = 'none';
    document.getElementById('followupList').innerHTML = '<li class="followup-empty">None yet</li>';
    document.querySelectorAll('.doc-item').forEach(el => el.style.background = '');
  }

  return { render, reset, SCENARIOS };
})();

// ── renderLive: handles real AI suggestion from server (live mode) ──
// Appended to existing AICoach module via prototype extension

(function extendAICoach() {
  const orig = AICoach;

  AICoach.renderLive = function(suggestion) {
    if (!suggestion) return;

    const { tag, tagLabel, answer, note, followups, confidence } = suggestion;

    // Reuse _setMetrics by calling render logic directly
    const confEl  = document.getElementById('metricConf');
    const fillEl  = document.getElementById('confFill');
    const typeEl  = document.getElementById('metricType');
    const qEl     = document.getElementById('metricQ');

    qEl.textContent    = parseInt(qEl.textContent || '0') + 1;
    confEl.textContent = confidence + '%';
    typeEl.textContent = tagLabel || tag;

    fillEl.style.width      = confidence + '%';
    fillEl.style.background =
      confidence >= 90 ? 'var(--brand)' :
      confidence >= 75 ? 'var(--warn)' : 'var(--danger)';

    const badge = document.getElementById('aiBadge');
    badge.textContent   = tagLabel || tag;
    badge.className     = 'ai-badge ' + (tag || 'tech');
    badge.style.display = 'inline-block';

    document.getElementById('aiContent').innerHTML = `
      <div class="ai-suggestion-label">Suggested response</div>
      <div class="ai-answer">${answer || ''}</div>
      <div class="ai-note">${note || ''}</div>
      <button class="copy-btn" id="copyBtn">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Copy response
      </button>`;

    document.getElementById('copyBtn').addEventListener('click', function () {
      navigator.clipboard.writeText(answer).catch(() => {});
      this.textContent = '✓ Copied!';
      this.classList.add('copied');
      setTimeout(() => {
        this.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy response`;
        this.classList.remove('copied');
      }, 2000);
    });

    if (followups && followups.length) {
      const ul = document.getElementById('followupList');
      ul.innerHTML = followups.map(f => `<li>${f}</li>`).join('');
    }
  };
})();