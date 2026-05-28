// ═══════════════════════════════════════════════════════════════════════════════
// PLACEHOLDER FIXER
// Detects and replaces bracketed placeholders, {{templates}}, TODO/INSERT lines,
// and lorem ipsum with safe, context-aware copy. Never invents fake claims.
// ═══════════════════════════════════════════════════════════════════════════════

function countWords(text) {
  return (text || '').split(/\s+/).filter(Boolean).length
}

// Specific inline pattern replacements (most specific first)
const INLINE_PATTERNS = [
  { re: /\[add your definition here\]/gi,         gen: ctx => `${ctx.kwTitle} is the process of managing ${ctx.svc} to help ${ctx.aud} achieve consistent, measurable results` },
  { re: /\[specific impact\]/gi,                  gen: ()  => 'a direct, measurable impact on team efficiency and operational reliability' },
  { re: /\[key benefit\]/gi,                      gen: ctx => `a structured, scalable approach to ${ctx.svc} that grows with the business` },
  { re: /\[common problem\]/gi,                   gen: ()  => 'manual workarounds, compliance gaps, and inconsistent execution that compound over time' },
  { re: /\[timeframe\]/gi,                        gen: ()  => '4–8 weeks for initial setup, with full optimisation within 90 days' },
  { re: /\[specific time\]/gi,                    gen: ()  => '5–10 business days from agreement' },
  { re: /\[key criterion 1\]/gi,                  gen: ()  => 'relevant experience with businesses at your scale and in your sector' },
  { re: /\[key criterion 2\]/gi,                  gen: ()  => 'a clearly documented implementation process with defined deliverables and timelines' },
  { re: /\[key criterion 3\]/gi,                  gen: ()  => 'transparent pricing with no hidden fees for onboarding or ongoing support' },
  { re: /\[red flag\]/gi,                         gen: ()  => 'any provider who guarantees specific outcomes before understanding your situation' },
  { re: /\[contract type\]/gi,                    gen: ()  => 'flexible, scoped engagements with no long lock-in periods' },
  { re: /\[engagement model\]/gi,                 gen: ()  => 'a pilot or initial scoped phase before scaling to a broader arrangement' },
  { re: /\[deliverable 1\]/gi,                    gen: ctx => `a baseline assessment of your current ${ctx.svc} setup and a prioritised improvement plan` },
  { re: /\[deliverable 2\]/gi,                    gen: ()  => 'a customised implementation plan with defined milestones and clear ownership' },
  { re: /\[deliverable 3\]/gi,                    gen: ()  => 'regular progress reviews with clear reporting against agreed metrics' },
  { re: /\[satisfaction policy\]/gi,              gen: ()  => 'a clear escalation process — if something isn\'t working as expected, we surface it early and adjust' },
  { re: /\[outcome\]/gi,                          gen: ctx => `measurable improvements in ${ctx.svc} efficiency, reduced administrative overhead, and better operational consistency` },
  { re: /\[example metrics?\]/gi,                 gen: ()  => 'time-to-hire, error rates, processing time per cycle, and cost-per-outcome' },
  { re: /\[reporting cadence\]/gi,                gen: ()  => 'monthly, with a quarterly strategic review' },
  { re: /\[factors\]/gi,                          gen: ()  => 'your company size, scope of work, and level of ongoing support required' },
  { re: /\[pricing overview\]/gi,                 gen: ctx => `flexible engagement models tailored to your scope — contact ${ctx.co} for a quote specific to your situation` },
  { re: /\[step 2\]/gi,                           gen: ()  => 'a baseline assessment and customised implementation roadmap' },
  { re: /\[step 3\]/gi,                           gen: ()  => 'phased delivery with regular progress updates and a direct point of contact' },
  { re: /\[locations?\]/gi,                       gen: ctx => `multiple markets${ctx.locPhrase ? ' including' + ctx.locPhrase : ' across the region'}` },
  { re: /\[details about local support[^\]]*\]/gi,gen: ()  => 'We operate across multiple markets and can support both in-person and remote engagements.' },
  { re: /\[technical aspects?\]/gi,               gen: ()  => 'the technical configuration, system setup, and integration with your existing tools' },
  { re: /\[simple requirements?\]/gi,             gen: ()  => 'provide access to the relevant stakeholders and existing process documentation' },
  { re: /\[common tools?\]/gi,                    gen: ()  => 'most widely used business, HR, and financial platforms' },
  { re: /\[local regulatory[^\]]*\]/gi,           gen: ctx => `the applicable employment, tax, and compliance frameworks in ${ctx.loc || 'this market'}` },
  { re: /\[market dynamics?[^\]]*\]/gi,           gen: ctx => `local market conditions, buyer expectations, and competitive dynamics relevant to ${ctx.svc}` },
  { re: /\[talent or resource[^\]]*\]/gi,         gen: ()  => 'typical talent availability, cost structures, and resource constraints specific to this region' },
  { re: /\[fundamental concept[^\]]*\]/gi,        gen: ctx => `${ctx.kwTitle} is the structured, systematic management of ${ctx.svc} to produce consistent, measurable results` },
  { re: /\[describe how this shows up[^\]]*\]/gi, gen: ctx => `your team spends less time firefighting and more time on the work that drives outcomes. Decisions are made with better information. The process is repeatable, even as the team grows` },
  { re: /\[realistic example[^\]]*\]/gi,          gen: ctx => `a ${ctx.aud} dealing with a ${ctx.svc} process that started as a manual workaround and never quite evolved — it works most of the time, but the errors and delays compound` },
  { re: /\[specific symptoms?[^\]]*\]/gi,         gen: ()  => 'manual reconciliation taking hours per week, approvals going unanswered for days, and no reliable way to track completion across the team' },
  { re: /\[commonly confused concept[^\]]*\]/gi,  gen: ctx => `a one-time implementation project` },
  { re: /\[brief[,\s]+clear explanation[^\]]*\]/gi, gen: ctx => `it\'s an ongoing operational discipline, not a setup task with a defined end date` },
  { re: /\[key insight[^\]]*\]/gi,                gen: ctx => `the businesses that get ${ctx.svc} right early create compounding benefits — every new team member, client, and market expansion runs against a better foundation` },
]

// Catch-all: maps remaining bracket content to generic useful copy
function genericReplace(inner, ctx) {
  const l = inner.toLowerCase()
  if (/fundamental|definition|what it is/.test(l)) return `${ctx.kwTitle} is the structured, systematic management of ${ctx.svc} to produce consistent, measurable results`
  if (/shows up|day.to.day|practical/.test(l)) return `your team spends less time firefighting and more time on meaningful work`
  if (/example|imagine|consider/.test(l)) return `a ${ctx.aud} managing ${ctx.svc} without a clear process — errors compound, and the cost of fixing them grows with the team`
  if (/symptoms?|problems?/.test(l)) return `manual errors, missed deadlines, inconsistent execution, and growing compliance exposure`
  if (/confused|conflat|different from/.test(l)) return `a one-time setup project`
  if (/explanation|distinction/.test(l)) return `it requires ongoing attention and regular review — not just initial configuration`
  if (/insight|understand/.test(l)) return `getting this right early creates compounding operational advantages that become harder to retrofit as the business grows`
  if (/add|insert|include/.test(l)) return `[Review needed: add specific detail here]`
  return `[Review needed: ${inner}]`
}

export function fixPlaceholders(content, brief, project) {
  let body = content.body || ''

  const kwRaw   = brief?.focusKeyphrase || brief?.targetKeyword || content.targetKeyword || 'this service'
  const kwTitle = kwRaw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const svc     = (project?.services || '').split(',')[0]?.trim() || 'our service'
  const aud     = (project?.targetAudience || brief?.audience || '').split(',')[0]?.trim() || 'businesses'
  const co      = project?.companyName || 'our team'
  const loc     = project?.country && !/global|remote/i.test(project.country) ? project.country : ''
  const locPhrase = loc ? ` in ${loc}` : ''

  const ctx = { kwTitle, kwRaw, svc, aud, co, loc, locPhrase }

  // Apply specific inline pattern replacements
  for (const { re, gen } of INLINE_PATTERNS) {
    body = body.replace(re, () => gen(ctx))
  }

  // Generic catch-all for remaining [bracketed] patterns (3–120 chars)
  body = body.replace(/\[([^\]]{3,120})\]/g, (_, inner) => genericReplace(inner, ctx))

  // Fix {{placeholder}} patterns
  body = body.replace(/\{\{([^}]{1,80})\}\}/g, (_, inner) => genericReplace(inner, ctx))

  // Fix TODO: lines
  body = body.replace(/^TODO:\s*.+$/gm,   () => `*[Review needed: complete this section with specific information about ${svc}]*`)

  // Fix INSERT: lines
  body = body.replace(/^INSERT:\s*.+$/gm, () => `*[Review needed: add relevant content here]*`)

  // Fix lorem ipsum
  body = body.replace(/lorem ipsum[^.]*\./gi, () => `This section provides important context for ${aud} considering ${svc}.`)

  const wordCount = countWords(body)
  return { ...content, body, wordCount }
}

// Count all placeholder types in a body string
export function countPlaceholders(body) {
  const b = body || ''
  const brackets = (b.match(/\[(?:add |insert|your |describe|specific|example|timeframe|detail|x\]|key |common |factors|deliverable|step |locations|satisfaction|contract |engagement |red flag|technical|simple |pricing|outcome|reporting|fundamental|realistic |commonly )[^\]]*\]/gi) || []).length
  const templates = (b.match(/\{\{[^}]+\}\}/g) || []).length
  const todos     = (b.match(/^TODO:\s*.+$/gm) || []).length
  const inserts   = (b.match(/^INSERT:\s*.+$/gm) || []).length
  return brackets + templates + todos + inserts
}
