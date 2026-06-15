/**
 * Caretta Knowledge Base Dataset
 * --------------------------------
 * Real B2B SaaS sales Q&A dataset covering the most common
 * prospect questions across 8 categories.
 *
 * Each entry has:
 *  - id         : unique slug
 *  - category   : topic group
 *  - question   : typical prospect phrasing
 *  - answer     : concise sales-ready answer
 *  - keywords   : for fast keyword fallback
 *  - tags       : used to set coaching tag (tech/obj/danger/tip)
 */

const KB = [

  // ── SECURITY & COMPLIANCE ──────────────────────────────────────────────────
  {
    id: 'sec-encryption',
    category: 'Security',
    question: 'How do you encrypt our data?',
    answer: 'All data is encrypted with AES-256 at rest and TLS 1.3 in transit. Encryption keys are rotated every 90 days and stored in a separate key management service — never co-located with your data.',
    keywords: ['encrypt', 'encryption', 'aes', 'tls', 'data security', 'secure'],
    tags: ['tech'],
  },
  {
    id: 'sec-soc2',
    category: 'Security',
    question: 'Are you SOC 2 certified?',
    answer: 'Yes — SOC 2 Type II certified, audited annually by a Big Four firm. We are also ISO 27001 and GDPR compliant. Audit reports are available under NDA for enterprise prospects.',
    keywords: ['soc2', 'soc 2', 'iso', 'iso27001', 'certified', 'certification', 'audit', 'compliance'],
    tags: ['tech'],
  },
  {
    id: 'sec-gdpr',
    category: 'Security',
    question: 'How do you handle GDPR compliance?',
    answer: 'We are fully GDPR compliant. We act as a data processor under your DPA, offer data residency in EU regions, support the right to erasure within 30 days, and maintain a full data processing register. Our DPA is pre-signed and available immediately.',
    keywords: ['gdpr', 'dpa', 'data protection', 'privacy', 'european', 'eu', 'right to erasure'],
    tags: ['tech'],
  },
  {
    id: 'sec-sso',
    category: 'Security',
    question: 'Do you support SSO?',
    answer: 'Yes — SAML 2.0 and OAuth 2.0 SSO supported out of the box. Works with Okta, Azure AD, Google Workspace, and any SAML-compliant IdP. Setup takes under 30 minutes with our guided wizard.',
    keywords: ['sso', 'saml', 'oauth', 'okta', 'azure ad', 'single sign-on', 'login', 'identity'],
    tags: ['tech'],
  },
  {
    id: 'sec-pentest',
    category: 'Security',
    question: 'Do you do penetration testing?',
    answer: 'Yes — we run annual third-party pen tests and quarterly internal vulnerability scans. The most recent pen test summary is available under NDA. We also run a private bug bounty program.',
    keywords: ['penetration', 'pentest', 'pen test', 'vulnerability', 'bug bounty', 'security test'],
    tags: ['tech'],
  },
  {
    id: 'sec-access',
    category: 'Security',
    question: 'Who inside your company can access our data?',
    answer: 'Access is strictly need-to-know. Only 3 engineers have production database access, and all access is logged, audited, and requires MFA. Customer data is never accessed without explicit permission except to resolve a support ticket you raise.',
    keywords: ['access', 'who can see', 'data access', 'employee access', 'admin access'],
    tags: ['obj'],
  },

  // ── PRICING & CONTRACTS ────────────────────────────────────────────────────
  {
    id: 'price-model',
    category: 'Pricing',
    question: 'How does your pricing work?',
    answer: 'Per-seat monthly pricing. Starter starts at $29/seat, Pro at $79/seat with advanced analytics and priority support, Enterprise is custom-quoted with volume discounts typically 30-40% off list. Annual plans save 20% vs monthly.',
    keywords: ['price', 'pricing', 'cost', 'how much', 'fee', 'charge', 'plan', 'plans'],
    tags: ['obj'],
  },
  {
    id: 'price-enterprise',
    category: 'Pricing',
    question: 'Do you offer enterprise pricing?',
    answer: 'Yes — enterprise deals include custom pricing, dedicated CSM, SLA upgrades, custom contract terms, and SSO at no extra cost. Most enterprise contracts land between $50K-$200K ARR depending on seat count. Happy to get you a formal quote today.',
    keywords: ['enterprise', 'enterprise pricing', 'large team', 'volume', 'bulk'],
    tags: ['obj'],
  },
  {
    id: 'price-trial',
    category: 'Pricing',
    question: 'Do you offer a free trial?',
    answer: 'Yes — 14-day full-featured free trial, no credit card required. For enterprise, we offer a 30-day POC with dedicated onboarding support. Most customers see their first value within the first 48 hours.',
    keywords: ['trial', 'free trial', 'try', 'test', 'poc', 'proof of concept', 'demo'],
    tags: ['tip'],
  },
  {
    id: 'price-contract',
    category: 'Pricing',
    question: 'Can we do a month-to-month contract?',
    answer: 'Yes, month-to-month is available on Starter and Pro plans. Enterprise customers typically sign 1-3 year terms for the best pricing, but we can do shorter pilot periods to get you comfortable before committing.',
    keywords: ['contract', 'month-to-month', 'annual', 'lock in', 'commitment', 'term'],
    tags: ['obj'],
  },
  {
    id: 'price-discount',
    category: 'Pricing',
    question: 'Can you do better on price?',
    answer: 'We have flexibility on multi-year, large-seat, or non-profit deals. Annual prepay saves 20%, and teams over 50 seats get an additional 15% off. Let me understand your needs better — what seat count and use case are you working with?',
    keywords: ['discount', 'negotiate', 'better price', 'cheaper', 'deal', 'reduce'],
    tags: ['obj'],
  },

  // ── INTEGRATIONS ───────────────────────────────────────────────────────────
  {
    id: 'int-salesforce',
    category: 'Integrations',
    question: 'Do you integrate with Salesforce?',
    answer: 'Yes — native Salesforce AppExchange app, bi-directional sync, one-click install. Activities, contacts, and pipeline data sync in real time. The integration is used by 60% of our customer base and takes under 15 minutes to configure.',
    keywords: ['salesforce', 'crm', 'salesforce integration', 'appexchange', 'sfdc'],
    tags: ['tech'],
  },
  {
    id: 'int-hubspot',
    category: 'Integrations',
    question: 'What about HubSpot?',
    answer: 'Native HubSpot integration available on Pro and Enterprise plans. Syncs deals, contacts, and activities. You can also trigger automated workflows in HubSpot based on events in our platform.',
    keywords: ['hubspot', 'hub spot', 'crm', 'marketing'],
    tags: ['tech'],
  },
  {
    id: 'int-api',
    category: 'Integrations',
    question: 'Do you have an API?',
    answer: 'Yes — full REST API with OpenAPI 3.0 spec, comprehensive docs at docs.caretta.ai, client SDKs for Python, Node, and Ruby. Rate limit is 1,000 requests/min on Enterprise, 200/min on Pro. Webhooks available for all key events.',
    keywords: ['api', 'rest api', 'webhook', 'developer', 'sdk', 'integrate', 'build on'],
    tags: ['tech'],
  },
  {
    id: 'int-slack',
    category: 'Integrations',
    question: 'Can you push notifications to Slack?',
    answer: 'Yes — Slack integration ships out of the box. You can configure alerts for key events, daily digest reports, and real-time notifications to any Slack channel. Takes 2 minutes to set up via OAuth.',
    keywords: ['slack', 'notification', 'alert', 'teams', 'microsoft teams', 'chat'],
    tags: ['tech'],
  },
  {
    id: 'int-zapier',
    category: 'Integrations',
    question: 'Is there a Zapier integration?',
    answer: 'Yes — 50+ Zaps available on Zapier and Make (Integromat). This lets you connect to 5,000+ tools even if we don\'t have a native integration. Most common use: pushing events to Google Sheets, Notion, or Airtable.',
    keywords: ['zapier', 'make', 'integromat', 'automation', 'no-code', 'connect'],
    tags: ['tech'],
  },

  // ── INFRASTRUCTURE & RELIABILITY ───────────────────────────────────────────
  {
    id: 'infra-uptime',
    category: 'Infrastructure',
    question: 'What is your uptime SLA?',
    answer: '99.9% uptime SLA on Pro, 99.99% on Enterprise (that\'s less than 1 hour downtime per year). We publish a live status page at status.caretta.ai and have averaged 99.97% uptime over the last 12 months.',
    keywords: ['uptime', 'sla', 'downtime', 'availability', 'reliability', 'status'],
    tags: ['tech'],
  },
  {
    id: 'infra-cloud',
    category: 'Infrastructure',
    question: 'Where is your infrastructure hosted?',
    answer: 'AWS multi-region deployment across US-East, US-West, and EU-West-1. We use auto-scaling, multi-AZ redundancy, and geo-load balancing. Data residency can be locked to EU or US regions on Enterprise plans.',
    keywords: ['hosting', 'cloud', 'aws', 'infrastructure', 'region', 'data residency', 'where is data'],
    tags: ['tech'],
  },
  {
    id: 'infra-onprem',
    category: 'Infrastructure',
    question: 'Can you deploy on-premise?',
    answer: 'Yes — on-premise and private cloud deployment available on Enterprise. We ship a Docker/Kubernetes package with full setup documentation. Most on-prem installs go live within 2 days. Air-gapped deployments also supported for regulated industries.',
    keywords: ['on-premise', 'on premise', 'on-prem', 'self-hosted', 'private cloud', 'docker', 'kubernetes', 'k8s'],
    tags: ['tech'],
  },
  {
    id: 'infra-backup',
    category: 'Infrastructure',
    question: 'How often do you back up data?',
    answer: 'Continuous incremental backups with full snapshots every 6 hours. Backups are retained for 30 days on Pro and 1 year on Enterprise. Point-in-time recovery is available, and we test restores quarterly.',
    keywords: ['backup', 'recovery', 'restore', 'data loss', 'disaster recovery', 'rto', 'rpo'],
    tags: ['tech'],
  },
  {
    id: 'infra-scale',
    category: 'Infrastructure',
    question: 'Can you handle our scale?',
    answer: 'Our largest customer processes 50 million events per day on our platform. We auto-scale horizontally and have handled 10x traffic spikes without degradation. Happy to do a load test during your POC to prove it.',
    keywords: ['scale', 'scalability', 'performance', 'load', 'volume', 'large', 'high traffic', 'millions'],
    tags: ['tech'],
  },

  // ── SUPPORT & ONBOARDING ───────────────────────────────────────────────────
  {
    id: 'sup-support',
    category: 'Support',
    question: 'What kind of support do you offer?',
    answer: 'Email and chat support on all plans (8am-8pm EST). Pro adds phone support and a 4-hour response SLA. Enterprise gets a dedicated Customer Success Manager, 24/7 support, and 1-hour critical response SLA.',
    keywords: ['support', 'help', 'customer success', 'csm', 'response time', 'ticket'],
    tags: ['tip'],
  },
  {
    id: 'sup-onboarding',
    category: 'Support',
    question: 'How long does onboarding take?',
    answer: 'Self-serve onboarding takes 30 minutes — we have interactive setup guides. Guided onboarding with our team is 2-3 sessions over 1-2 weeks. Most teams are fully live within 2 weeks. We assign an onboarding specialist on Pro and above.',
    keywords: ['onboarding', 'setup', 'implementation', 'get started', 'how long', 'deploy', 'launch'],
    tags: ['tip'],
  },
  {
    id: 'sup-training',
    category: 'Support',
    question: 'Do you provide training?',
    answer: 'Yes — live training sessions, on-demand video library, and a certification program. Enterprise includes unlimited live training for your team. We also have a Slack community of 3,000+ practitioners.',
    keywords: ['training', 'learn', 'tutorial', 'documentation', 'docs', 'resources', 'certification'],
    tags: ['tip'],
  },

  // ── COMPETITIVE ────────────────────────────────────────────────────────────
  {
    id: 'comp-competitor-x',
    category: 'Competitive',
    question: 'How are you different from Competitor X?',
    answer: 'Great question — I\'d rather focus on what matters to you than bash the competition. The main differences customers tell us they value: faster time-to-value (live in days vs weeks), no-code setup, and our AI layer that surfaces insights automatically. What\'s most important to your team?',
    keywords: ['competitor', 'vs', 'alternative', 'compare', 'comparison', 'difference', 'better than'],
    tags: ['danger'],
  },
  {
    id: 'comp-switch',
    category: 'Competitive',
    question: 'We are already using another tool. Why should we switch?',
    answer: 'The switching cost is real, and I won\'t pretend otherwise. Most customers who switch tell us three things drove it: the old tool didn\'t scale with them, the AI/automation capabilities fell short, or support response times hurt their team. Would any of those resonate with your experience?',
    keywords: ['switch', 'switching', 'already using', 'current tool', 'migrate', 'migration', 'replace'],
    tags: ['obj'],
  },
  {
    id: 'comp-price-lower',
    category: 'Competitive',
    question: 'Your competitor is cheaper.',
    answer: 'I understand — price matters. The question is total cost of ownership: if our automation saves your team 5 hours a week, at $50/hr that\'s $13K/year in recovered time. Our ROI calculator can model this for your team size. Would that be useful?',
    keywords: ['cheaper', 'lower price', 'less expensive', 'competitor price', 'cost comparison'],
    tags: ['danger'],
  },

  // ── DATA & PRIVACY ─────────────────────────────────────────────────────────
  {
    id: 'data-ownership',
    category: 'Data',
    question: 'Who owns our data?',
    answer: 'You own your data — 100%. We act purely as a processor under your instructions. We never use your data to train models, sell to third parties, or analyze for any purpose other than running the service for you. Data is exported or deleted within 30 days of contract end.',
    keywords: ['data ownership', 'own data', 'our data', 'who owns', 'data rights'],
    tags: ['obj'],
  },
  {
    id: 'data-delete',
    category: 'Data',
    question: 'What happens to our data if we leave?',
    answer: 'You can export all your data in CSV/JSON at any time via the dashboard. After contract termination, we retain data for 30 days so you can complete export, then permanently delete it. We provide a deletion certificate on request.',
    keywords: ['delete', 'deletion', 'leave', 'cancel', 'export', 'data portability', 'offboard'],
    tags: ['obj'],
  },
  {
    id: 'data-third-party',
    category: 'Data',
    question: 'Do you share our data with third parties?',
    answer: 'No. We have a strict no-data-sharing policy. Sub-processors (AWS, Stripe, SendGrid) are listed in our privacy policy and only receive the minimum data needed to function. We never sell or share data for advertising or analytics purposes.',
    keywords: ['third party', 'share data', 'sell data', 'sub-processor', 'vendor', 'external'],
    tags: ['obj'],
  },

  // ── PRODUCT FEATURES ───────────────────────────────────────────────────────
  {
    id: 'feat-ai',
    category: 'Features',
    question: 'How does your AI work?',
    answer: 'Our AI is a RAG-based system — it retrieves relevant context from your product knowledge base, then uses a fine-tuned LLM to generate accurate, grounded answers. It never hallucinates because every answer is anchored to your documentation. Average response latency is under 800ms.',
    keywords: ['ai', 'artificial intelligence', 'machine learning', 'how ai', 'ai model', 'llm', 'gpt'],
    tags: ['tech'],
  },
  {
    id: 'feat-mobile',
    category: 'Features',
    question: 'Is there a mobile app?',
    answer: 'Yes — iOS and Android apps available, plus a progressive web app that works offline. The mobile app has full feature parity with desktop for the core workflow, with simplified views for on-the-go use.',
    keywords: ['mobile', 'ios', 'android', 'app', 'phone', 'tablet', 'offline'],
    tags: ['tech'],
  },
  {
    id: 'feat-analytics',
    category: 'Features',
    question: 'What analytics do you provide?',
    answer: 'Real-time dashboards for usage, performance, and ROI metrics. Pro includes custom report builder, trend analysis, and scheduled email reports. Enterprise adds predictive analytics, cohort analysis, and raw data export via API or S3.',
    keywords: ['analytics', 'reporting', 'dashboard', 'metrics', 'insights', 'report', 'data'],
    tags: ['tech'],
  },
  {
    id: 'feat-customise',
    category: 'Features',
    question: 'Can we customise it for our workflow?',
    answer: 'Yes — custom fields, workflows, and role-based views on all plans. Pro adds no-code workflow builder. Enterprise includes custom modules, white-labelling, and dedicated engineering hours for bespoke features in our roadmap process.',
    keywords: ['customise', 'customize', 'custom', 'workflow', 'configure', 'tailor', 'flexible'],
    tags: ['tech'],
  },
  {
    id: 'feat-permissions',
    category: 'Features',
    question: 'How does role-based access control work?',
    answer: 'RBAC is available on all plans with 4 built-in roles (Owner, Admin, Member, Viewer). Pro adds custom roles with field-level permissions. Enterprise adds attribute-based access control (ABAC) for complex org structures.',
    keywords: ['rbac', 'role', 'permissions', 'access control', 'admin', 'user management'],
    tags: ['tech'],
  },

  // ── ROADMAP & FUTURE ───────────────────────────────────────────────────────
  {
    id: 'road-feature',
    category: 'Roadmap',
    question: 'Can you add a feature we need?',
    answer: 'We have a public roadmap and take customer requests seriously — 40% of our last quarter\'s features came from customer feedback. Enterprise customers get a dedicated feedback channel and direct input into quarterly planning. What feature do you have in mind?',
    keywords: ['feature request', 'roadmap', 'add feature', 'custom feature', 'build', 'develop'],
    tags: ['tip'],
  },
  {
    id: 'road-stability',
    category: 'Roadmap',
    question: 'How mature is your product?',
    answer: 'We launched in 2021, have 500+ customers, $12M ARR, and are Series A funded. Core features have been stable for 2+ years. We ship weekly updates — see our changelog — and maintain a 6-month deprecation notice for any API changes.',
    keywords: ['mature', 'stable', 'startup', 'funding', 'how old', 'established', 'company size', 'revenue'],
    tags: ['obj'],
  },
];

module.exports = KB;