import { generateId } from './storage'

// ═══════════════════════════════════════════════════════════════════════════════
// TEXT ANALYSIS PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════

function countWords(text) {
  return (text || '').split(/\s+/).filter(Boolean).length
}

function countOccurrences(text, keyword) {
  if (!keyword || !text) return 0
  const re = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
  return (text.match(re) || []).length
}

function getH2Count(body) {
  return (body.match(/^##\s+.+/gm) || []).length
}

function getH3Count(body) {
  return (body.match(/^###\s+.+/gm) || []).length
}

function hasFAQSection(body) {
  return /##\s+.*(faq|frequently asked|question)/i.test(body)
}

function bulletCount(body) {
  return (body.match(/^[ \t]*[-*]\s+.+/gm) || []).length
}

function numberedListCount(body) {
  return (body.match(/^\d+\.\s+.+/gm) || []).length
}

function avgSentenceLength(body) {
  const sentences = (body || '').split(/[.!?]+/).filter(s => s.trim().length > 15)
  if (!sentences.length) return 0
  const total = sentences.reduce((sum, s) => sum + countWords(s), 0)
  return Math.round(total / sentences.length)
}

// Words from the first N non-heading lines — used to check keyword in intro
function getIntroText(body, wordLimit = 200) {
  const lines = (body || '').split('\n').filter(l => l.trim() && !l.startsWith('#'))
  return lines.join(' ').split(/\s+/).slice(0, wordLimit).join(' ').toLowerCase()
}

// Count paragraphs longer than wordLimit words
function longParagraphCount(body, wordLimit = 90) {
  return (body || '')
    .split('\n\n')
    .filter(p => p.trim() && !p.trim().startsWith('#'))
    .filter(p => countWords(p) > wordLimit).length
}

// True if any chunk between headings exceeds 280 words
function hasTextWalls(body) {
  const chunks = (body || '').split(/^##+ .+$/m)
  return chunks.some(chunk => countWords(chunk) > 280)
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT DERIVATION
// Resolves country / industry from: project arg → brief.audience → body scan
// scoreContent() accepts project as optional 3rd arg for richer local scoring
// ═══════════════════════════════════════════════════════════════════════════════

// Singapore-specific regulatory / market term patterns
const RE_SG_HR       = /\b(mom|cpf|work pass|work permit|s pass|employment pass|employment act|fair consideration|fcf|foreign worker levy|tripartism)\b/i
const RE_SG_FINANCE  = /\b(iras|gst|acra|xbrl|mas\b|monetary authority of singapore|pcb|income tax act|gst-registered)\b/i
const RE_SG_TECH     = /\b(pdpa|imda|mas trm|technology risk management|smes go digital|digital resilience bonus|infocomm)\b/i
const RE_SG_SME      = /\b(psg|edg|enterprise singapore|skillsfuture|productivity solutions grant|enterprise development grant|entsg)\b/i
const RE_SG_GENERAL  = /\b(singapore|sgd|sg market|sg companies|sg businesses|jurong|tanjong pagar|one-north)\b/i

function deriveCtx(content, brief, project) {
  // ── Priority 1: explicit project object ────────────────────────────────────
  if (project?.country) {
    const isSG     = /singapore/i.test(project.country)
    const isGlobal = /global|remote/i.test(project.country)
    return {
      isSG,
      isGlobal,
      isLocal:     !isGlobal,
      country:     project.country,
      industry:    (project.industry    || '').toLowerCase(),
      services:    (project.services    || '').toLowerCase(),
      audience:    (project.targetAudience || '').toLowerCase(),
      companyName: project.companyName  || '',
      funnel:      brief?.funnel   || 'TOFU',
      pageType:    brief?.pageType || '',
    }
  }

  // ── Priority 2: location signals in brief.audience ─────────────────────────
  if (brief?.audience) {
    const aud      = brief.audience.toLowerCase()
    const isSG     = /singapore/i.test(aud)
    const otherLoc = aud.match(/\b(malaysia|indonesia|philippines|thailand|vietnam|india|australia|united kingdom|uk|usa|united states|canada|germany|netherlands)\b/i)?.[0] || ''
    const isGlobal = !isSG && !otherLoc
    return {
      isSG,
      isGlobal,
      isLocal:     !isGlobal,
      country:     isSG ? 'Singapore' : (otherLoc ? otherLoc : ''),
      industry:    '',
      services:    '',
      audience:    aud,
      companyName: '',
      funnel:      brief?.funnel   || 'TOFU',
      pageType:    brief?.pageType || '',
    }
  }

  // ── Priority 3: scan content body for Singapore term signals ──────────────
  const body    = (content?.body || '').toLowerCase()
  const hasSGSig = RE_SG_GENERAL.test(body) || RE_SG_HR.test(body) ||
                   RE_SG_FINANCE.test(body)  || RE_SG_TECH.test(body) || RE_SG_SME.test(body)
  return {
    isSG:        hasSGSig,
    isGlobal:    !hasSGSig,
    isLocal:     hasSGSig,
    country:     hasSGSig ? 'Singapore' : '',
    industry:    '',
    services:    '',
    audience:    '',
    companyName: '',
    funnel:      brief?.funnel   || 'TOFU',
    pageType:    brief?.pageType || '',
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ISSUE BUILDER
// Keeps issues as structured objects internally; flattened to strings for export
// ═══════════════════════════════════════════════════════════════════════════════

function issue(msg, fix, pts, cat) {
  return { msg, fix, pts, cat }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. SEO READINESS  — 25 % of overall
// ═══════════════════════════════════════════════════════════════════════════════

function scoreSEOReadiness(content, brief, ctx) {
  const { body = '', metaTitle = '', metaDescription = '', title = '', slug = '' } = content
  const keyword = (brief?.targetKeyword || '').toLowerCase()
  const wc      = countWords(body)
  const issues  = []
  const strengths = []
  let   pts     = 0

  // ── Keyword in H1 ─────────────────────────────────────────────── 20 pts ──
  if (title.toLowerCase().includes(keyword)) {
    pts += 20
    strengths.push(`Target keyword "${keyword}" is in the H1 title.`)
  } else {
    issues.push(issue(
      `"${keyword}" is missing from the H1 title — search engines weight the H1 heavily for topical relevance.`,
      `Rewrite the H1 to include "${keyword}" naturally. It should read as a genuine headline, not a stuffed keyword.`,
      20, 'SEO'
    ))
  }

  // ── Keyword in meta title ────────────────────────────────────── 15 pts ──
  if (metaTitle.toLowerCase().includes(keyword)) {
    pts += 15
    strengths.push('Meta title contains the target keyword.')
  } else {
    issues.push(issue(
      `Target keyword is absent from the meta title — the single strongest on-page SEO signal.`,
      `Add "${keyword}" to the meta title, ideally near the start. Keep the title 50–62 characters.`,
      15, 'SEO'
    ))
  }

  // ── Meta title length ─────────────────────────────────────────── 10 pts ──
  const mtLen = metaTitle.length
  if (mtLen >= 50 && mtLen <= 62) {
    pts += 10
    strengths.push(`Meta title length is ideal at ${mtLen} characters.`)
  } else if (mtLen > 0 && mtLen >= 44 && mtLen <= 68) {
    pts += 5
    issues.push(issue(
      `Meta title is ${mtLen} characters — the ideal window is 50–62 characters.`,
      mtLen < 50
        ? `Expand the meta title to be more descriptive and clickable. Aim for 50–62 characters.`
        : `Trim the meta title — Google truncates titles beyond ~62 characters with "..." in search results.`,
      5, 'SEO'
    ))
  } else if (mtLen > 0) {
    issues.push(issue(
      `Meta title is ${mtLen} characters — well outside the 50–62 character range Google displays in search results.`,
      `Rewrite the meta title to fit 50–62 characters. Include the keyword and a clear benefit or differentiator.`,
      10, 'SEO'
    ))
  } else {
    issues.push(issue(
      `Meta title is missing entirely — this is a critical omission for SEO.`,
      `Add a meta title that includes "${keyword}" and is 50–62 characters. This is the most visible SEO field in search results.`,
      10, 'SEO'
    ))
  }

  // ── Keyword in meta description ───────────────────────────────── 8 pts ──
  if (metaDescription.toLowerCase().includes(keyword)) {
    pts += 8
    strengths.push('Meta description includes the target keyword — Google bolds matching terms in search results, improving click-through.')
  } else {
    issues.push(issue(
      `"${keyword}" is missing from the meta description. Google bolds keyword matches in snippets — this directly affects click-through rate.`,
      `Add "${keyword}" to the meta description naturally. Aim to place it within the first 100 characters.`,
      8, 'SEO'
    ))
  }

  // ── Meta description length ───────────────────────────────────── 5 pts ──
  const mdLen = metaDescription.length
  if (mdLen >= 130 && mdLen <= 162) {
    pts += 5
    strengths.push(`Meta description is ${mdLen} characters — within the ideal 130–162 range.`)
  } else if (mdLen > 0 && mdLen >= 110 && mdLen <= 175) {
    pts += 2
    issues.push(issue(
      `Meta description is ${mdLen} characters — ideal is 130–162 characters.`,
      mdLen < 130
        ? `Expand the meta description. A fuller snippet gives the reader more reason to click.`
        : `Trim the meta description to avoid Google truncating it mid-sentence.`,
      3, 'SEO'
    ))
  } else if (mdLen > 0) {
    issues.push(issue(
      `Meta description is ${mdLen} characters — significantly outside the 130–162 character ideal.`,
      `Rewrite the meta description: include the keyword, state the key benefit, and end with a soft call to action. Aim for 130–162 characters.`,
      5, 'SEO'
    ))
  } else {
    issues.push(issue(
      `Meta description is missing. This directly affects click-through rate from search results — Google may auto-generate one that misrepresents the page.`,
      `Write a 130–162 character meta description that includes the keyword, states a clear benefit, and invites the click.`,
      5, 'SEO'
    ))
  }

  // ── Keyword in intro (first 200 words) ───────────────────────── 12 pts ──
  const intro = getIntroText(body, 200)
  if (intro.includes(keyword)) {
    pts += 12
    strengths.push('Target keyword appears in the opening paragraph — strong topical signal for search engines.')
  } else {
    issues.push(issue(
      `"${keyword}" doesn't appear in the first 200 words. Early keyword placement is one of the clearest signals of page relevance.`,
      `Include "${keyword}" in the opening paragraph naturally — within the first 2–3 sentences if possible.`,
      12, 'SEO'
    ))
  }

  // ── Keyword density ────────────────────────────────────────────── 8 pts ──
  const kwCount = countOccurrences(body, keyword)
  const density = wc > 0 ? (kwCount / wc) * 100 : 0
  if (density >= 0.8 && density <= 2.2) {
    pts += 8
    strengths.push(`Keyword density is healthy at ${density.toFixed(1)}% (${kwCount} uses in ${wc} words).`)
  } else if (density > 2.2 && density <= 3.5) {
    pts += 3
    issues.push(issue(
      `Keyword density is ${density.toFixed(1)}% — slightly above the 0.8–2.2% sweet spot. Repetition can read as unnatural to both humans and algorithms.`,
      `Reduce instances of "${keyword}" by 3–5. Replace some with natural synonyms or slight rephrasing. Read it aloud — if it sounds repetitive, it probably is.`,
      5, 'SEO'
    ))
  } else if (density > 3.5) {
    issues.push(issue(
      `Keyword density is ${density.toFixed(1)}% — this is keyword stuffing territory. Google's algorithms penalise unnatural repetition.`,
      `Significantly reduce the number of times "${keyword}" appears verbatim. Replace instances with synonyms, related phrases, or rephrase sentences entirely.`,
      8, 'SEO'
    ))
  } else if (density > 0) {
    pts += 3
    issues.push(issue(
      `Keyword density is only ${density.toFixed(1)}% — "${keyword}" appears ${kwCount} time${kwCount > 1 ? 's' : ''} in ${wc} words. This is below the natural usage threshold.`,
      `Weave "${keyword}" and close variants into the body more naturally — in section openings, bullet points, and subheadings. Aim for 1–2% density.`,
      5, 'SEO'
    ))
  } else {
    issues.push(issue(
      `Target keyword "${keyword}" does not appear in the body text at all.`,
      `Add "${keyword}" throughout the body content — at minimum in the introduction, one or two body sections, and the conclusion.`,
      8, 'SEO'
    ))
  }

  // ── H2 structure ──────────────────────────────────────────────── 10 pts ──
  const h2s = getH2Count(body)
  if (h2s >= 5) {
    pts += 10
    strengths.push(`Strong H2 structure with ${h2s} sections — helps search engines parse the content hierarchy and helps readers navigate.`)
  } else if (h2s >= 3) {
    pts += 6
    issues.push(issue(
      `Only ${h2s} H2 sections found. Well-structured articles with 5+ H2s tend to outperform thin or flat content on competitive keywords.`,
      `Add 2–3 more H2 sections to improve topical depth. Check your content brief for suggested headings you haven't used yet.`,
      4, 'SEO'
    ))
  } else if (h2s >= 1) {
    pts += 2
    issues.push(issue(
      `Only ${h2s} H2 heading found. Search engines use heading structure to understand what a page covers — sparse structure signals thin content.`,
      `Add at least 4 H2 headings to structure the content clearly. Each major topic or question the reader has should have its own H2.`,
      8, 'SEO'
    ))
  } else {
    issues.push(issue(
      `No H2 headings found. Unstructured content significantly underperforms structured content across virtually all keyword types.`,
      `Add H2 headings throughout the content immediately. Start with the headings from your content brief — they were designed for this article.`,
      10, 'SEO'
    ))
  }

  // ── FAQ section ────────────────────────────────────────────────── 7 pts ──
  if (hasFAQSection(body)) {
    pts += 7
    strengths.push('FAQ section detected — expands topical coverage and enables FAQ rich result eligibility in Google.')
  } else {
    issues.push(issue(
      `No FAQ section found. FAQ content captures long-tail search queries and is frequently eligible for FAQ rich results that increase click-through rate.`,
      `Add an H2 "Frequently Asked Questions" section with 4–6 Q&A pairs. Use the FAQ list from your content brief as the starting point.`,
      7, 'SEO'
    ))
  }

  // ── Slug quality ───────────────────────────────────────────────── 5 pts ──
  const slugOk = slug && /^[a-z0-9-]+$/.test(slug) && slug.includes(keyword.split(' ')[0].toLowerCase())
  if (slugOk) {
    pts += 5
    strengths.push('URL slug is clean, lowercase, hyphenated, and keyword-relevant.')
  } else if (slug) {
    pts += 2
    issues.push(issue(
      `URL slug exists but may not include the target keyword or may use characters that create messy URLs.`,
      `Set the slug to: "${(brief?.slug || keyword.replace(/\s+/g, '-').toLowerCase())}". Lowercase, hyphen-separated, no special characters.`,
      3, 'SEO'
    ))
  } else {
    issues.push(issue(
      `URL slug is missing. The slug forms part of your page URL — it should contain the target keyword and be human-readable.`,
      `Set the slug to: "${keyword.replace(/\s+/g, '-').toLowerCase()}". Keep it short and keyword-focused.`,
      5, 'SEO'
    ))
  }

  return { score: Math.min(Math.round(pts), 100), issues, strengths, label: 'SEO Readiness', icon: 'Search' }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. HELPFUL CONTENT  — 22 % of overall
// Checks whether content genuinely helps the reader make progress
// ═══════════════════════════════════════════════════════════════════════════════

const GENERIC_FILLER = [
  'leverage', 'cutting-edge', 'game-changer', 'game changer', 'seamless experience',
  'robust solution', 'synergy', 'synergies', 'holistic approach', 'innovative solution',
  'revolutionize', 'revolutionise', 'best-in-class', 'world-class', 'empower your business',
  'paradigm shift', 'thought leader', 'actionable insights', 'move the needle',
  'deep dive', 'circle back', 'value-add', 'pain points at scale',
]

function scoreHelpfulContent(content, brief, ctx) {
  const { body = '' } = content
  const bodyL   = body.toLowerCase()
  const wc      = countWords(body)
  const { funnel, pageType } = ctx
  const isServicePage = /service|landing/i.test(pageType)
  const isBOFU  = funnel === 'BOFU'
  const isMOFU  = funnel === 'MOFU'
  const issues  = []
  const strengths = []
  let   pts     = 0

  // ── Word count calibrated to page type ───────────────────────── 20 pts ──
  const targets = isBOFU && isServicePage
    ? { great: 800,  ok: 500, label: 'service page' }
    : isBOFU
    ? { great: 950,  ok: 600, label: 'decision-stage article' }
    : isMOFU
    ? { great: 1100, ok: 750, label: 'comparison guide' }
    : { great: 1300, ok: 850, label: 'educational guide' }

  if (wc >= targets.great) {
    pts += 20
    strengths.push(`Word count (${wc.toLocaleString()} words) is well-suited to a ${targets.label}.`)
  } else if (wc >= targets.ok) {
    pts += 11
    issues.push(issue(
      `Content is ${wc} words — a ${targets.label} ideally needs ${targets.great}+ words to cover the topic with genuine depth.`,
      `Expand the thinner sections — especially how-it-works, benefits, and FAQ. Aim for ${targets.great}+ words total.`,
      9, 'Helpful'
    ))
  } else {
    pts += 3
    issues.push(issue(
      `Content is only ${wc} words — too thin for a ${targets.label}. Google's helpful content guidance expects substantive depth.`,
      `Add at least 2–3 new sections, expand existing ones, and ensure the FAQ has 5+ entries. Target ${targets.great}+ words.`,
      17, 'Helpful'
    ))
  }

  // ── FAQ section ───────────────────────────────────────────────── 12 pts ──
  if (hasFAQSection(body)) {
    pts += 12
    strengths.push('FAQ section directly addresses reader questions — builds trust and expands keyword coverage.')
  } else {
    issues.push(issue(
      `No FAQ section found. FAQs address the questions readers have after absorbing the main content — they reduce friction and build confidence.`,
      `Add an H2 "Frequently Asked Questions" section with 5–6 useful Q&As. Pull from the FAQ list in your content brief.`,
      12, 'Helpful'
    ))
  }

  // ── Practical examples ─────────────────────────────────────────── 12 pts ──
  const exSigs   = (bodyL.match(/\b(for example|for instance|to illustrate|such as|imagine|consider a|in practice|let's say|picture this|real-world|case in point)\b/g) || []).length
  const stepSigs = (bodyL.match(/\b(step [1-9]|step one|step two|step three|phase [1-9]|stage [1-9])\b/g) || []).length
  if (exSigs >= 3 || (exSigs >= 1 && stepSigs >= 2)) {
    pts += 12
    strengths.push('Content uses concrete examples and scenarios — abstract advice becomes actionable and memorable.')
  } else if (exSigs >= 1 || stepSigs >= 2) {
    pts += 6
    issues.push(issue(
      `Content has limited practical examples. Readers trust specific, grounded content far more than general descriptions.`,
      `Add 2–3 concrete scenarios. A format like "For example, if you're a 30-person company without a dedicated HR team..." makes abstract points tangible.`,
      6, 'Helpful'
    ))
  } else {
    issues.push(issue(
      `No practical examples or concrete scenarios found. Content that only makes general claims — without illustrating them — is perceived as lower quality.`,
      `Add real-world examples throughout. Use your audience context: "A typical [audience] dealing with [problem] would..." — even brief scenarios significantly increase credibility.`,
      12, 'Helpful'
    ))
  }

  // ── Who it's for / audience qualification ─────────────────────── 8 pts ──
  const audSigs = (bodyL.match(/\b(you.re a (good|strong|right|ideal) fit|ideal for|designed for|right for|who this is for|this is for|if you.re|not a fit|who should (use|consider|read))\b/gi) || []).length
  if (audSigs >= 2) {
    pts += 8
    strengths.push('Content clearly qualifies who it is — and isn\'t — for. This builds trust and improves conversion quality.')
  } else if (audSigs >= 1) {
    pts += 4
    issues.push(issue(
      `Content only briefly addresses who it's designed for. Readers need to quickly identify whether this applies to them.`,
      `Add a clearer "Who This Is For" section, or state the ideal reader in the intro and at one more point in the article.`,
      4, 'Helpful'
    ))
  } else {
    issues.push(issue(
      `Content doesn't specify who it's for. Without this, readers who can't self-identify as the target audience bounce — even if the content would help them.`,
      `Add a "Who This Is For" section: list 3–4 characteristics of the ideal reader, and optionally note who it's NOT suited for. This one section often significantly improves conversion.`,
      8, 'Helpful'
    ))
  }

  // ── Decision factors / evaluation criteria ─────────────────────── 8 pts ──
  const decSigs = (bodyL.match(/\b(factor|criteria|criterion|consider|evaluate|trade-off|tradeoff|shortlist|what to look for|how to choose|red flag|due diligence|key question)\b/g) || []).length
  if (decSigs >= 4) {
    pts += 8
    strengths.push('Content includes decision-making criteria — helping readers evaluate options positions the article as a strategic resource, not just a blog post.')
  } else if (decSigs >= 2) {
    pts += 4
    issues.push(issue(
      `Content touches on decision factors but could go deeper. Readers at the evaluation stage need clear, honest criteria to compare options.`,
      `Expand the evaluation section. Add 4–5 specific criteria — including trade-offs and things to be cautious of. Objective guidance builds more trust than advocacy.`,
      4, 'Helpful'
    ))
  } else {
    issues.push(issue(
      `Content doesn't help readers evaluate their options. This is especially important for MOFU and BOFU articles where the reader is comparing alternatives.`,
      `Add a "What to Look For" or "How to Evaluate" section with 4–5 honest criteria. Include what matters, what doesn't, and one or two red flags to watch for.`,
      8, 'Helpful'
    ))
  }

  // ── Process / how it works ─────────────────────────────────────── 8 pts ──
  const procSigs   = (bodyL.match(/\b(step [1-9]|how it works|how we work|our process|week [0-9]|month [0-9]|day [0-9]|phase [1-9]|stage [1-9])\b/gi) || []).length
  const hasProcessH2 = /##\s+.*(how.*work|step|process|approach|journey|expect)/i.test(body)
  if (procSigs >= 3 || hasProcessH2) {
    pts += 8
    strengths.push('Content explains the process — readers want to know what to expect, not just what\'s on offer.')
  } else if (procSigs >= 1) {
    pts += 4
    issues.push(issue(
      `Content only briefly covers how things work. Readers want to visualise the journey before they commit.`,
      `Expand or add a "How It Works" section. Break it into steps with realistic timeframes: "Week 1: Discovery, Weeks 2–4: Strategy, Month 2+: Execution."`,
      4, 'Helpful'
    ))
  } else {
    issues.push(issue(
      `No process or "how it works" content found. Without this, readers have to imagine what implementation looks like — and most won't bother.`,
      `Add a numbered "How It Works" or "Our Process" section with 4–5 clear steps and realistic timeframes. This reduces perceived risk and answers a reader's biggest unspoken question.`,
      8, 'Helpful'
    ))
  }

  // ── Honest expectations / limitations ────────────────────────── 8 pts ──
  const honestSigs = (bodyL.match(/\b(may not|won.t|can.t|doesn.t mean|limitation|not for everyone|honest(ly)?|can.t promise|depends on|realistic(ally)?|not a guarantee|caveat|important to note|not the right fit)\b/gi) || []).length
  if (honestSigs >= 3) {
    pts += 8
    strengths.push('Content sets honest expectations and acknowledges limitations — this is one of the clearest signals of genuine helpfulness.')
  } else if (honestSigs >= 1) {
    pts += 4
    issues.push(issue(
      `Content has limited acknowledgment of limitations. Content that only makes positive claims reads as promotional rather than authoritative.`,
      `Add 1–2 honest acknowledgments: what this won't fix, what results depend on, or who it's not suited for. A single honest caveat can do more for trust than a paragraph of benefits.`,
      4, 'Helpful'
    ))
  } else {
    issues.push(issue(
      `Content makes no acknowledgment of limitations, nuance, or honest expectations. Purely positive content is one of the key signals Google uses to identify low-quality promotional pages.`,
      `Add honest language somewhere in the article: "Results depend on...", "This won't solve...", "It's not the right fit if...". Even one honest caveat dramatically increases perceived credibility.`,
      8, 'Helpful'
    ))
  }

  // ── Generic AI filler check ────────────────────────────────────── 8 pts ──
  const fillerFound = GENERIC_FILLER.filter(f => bodyL.includes(f))
  if (fillerFound.length === 0) {
    pts += 8
    strengths.push('Content avoids generic AI filler phrases — it reads as specific and grounded.')
  } else if (fillerFound.length <= 2) {
    pts += 4
    issues.push(issue(
      `Content contains ${fillerFound.length} generic filler phrase${fillerFound.length > 1 ? 's' : ''}: "${fillerFound.join('", "')}". These weaken credibility.`,
      `Replace each with specific, concrete language. Instead of "seamless experience" — describe what the experience actually involves. Instead of "leverage" — write "use" or "apply."`,
      4, 'Helpful'
    ))
  } else {
    issues.push(issue(
      `Content contains ${fillerFound.length} generic filler phrases including: "${fillerFound.slice(0, 4).join('", "')}". This pattern makes content feel templated and reduces reader trust.`,
      `Do a search-and-replace pass on these phrases. Replace each with concrete, specific language. This single edit can significantly improve the content's perceived quality.`,
      8, 'Helpful'
    ))
  }

  // ── Placeholder text check ─────────────────────────────────────── 8 pts ──
  const PLACEHOLDER_RE = /\[(?:add |insert|your |describe|specific|example\]|timeframe\]|detail\]|x\]|key |common |factors|deliverable|step |locations|satisfaction|contract |engagement |red flag|technical|simple |pricing|outcome|reporting|fundamental|realistic |commonly )/gi
  const placeholders = (body.match(PLACEHOLDER_RE) || []).length
  if (placeholders === 0) {
    pts += 8
    strengths.push('No placeholder text detected — content appears complete.')
  } else if (placeholders <= 2) {
    pts += 3
    issues.push(issue(
      `${placeholders} placeholder${placeholders > 1 ? 's' : ''} found in the content. These must be replaced with real content before publishing.`,
      `Search for "[" in the content and replace every bracketed placeholder with specific, relevant detail about your business, audience, or market context.`,
      5, 'Helpful'
    ))
  } else {
    issues.push(issue(
      `${placeholders} unresolved placeholders found in the content. Publishing with placeholder text is a significant quality failure that will hurt both SEO and reader trust.`,
      `Go through the content and replace every bracketed placeholder with real, specific content. Do not publish until all placeholders are resolved.`,
      8, 'Helpful'
    ))
  }

  return { score: Math.min(Math.round(pts), 100), issues, strengths, label: 'Helpful Content', icon: 'Heart', hasPlaceholders: placeholders > 0 }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SINGAPORE / LOCAL RELEVANCE  — 8 % of overall
// Global projects auto-score 80 — no local context required
// Singapore projects: industry-specific regulatory + grant term checks
// Other local markets: penalised lightly for missing country references
// ═══════════════════════════════════════════════════════════════════════════════

function scoreLocalRelevance(content, brief, ctx) {
  const { body = '' } = content
  const { isSG, isGlobal, isLocal, country, industry, services } = ctx
  const issues    = []
  const strengths = []
  let   pts       = 0

  // ── Global / unspecified — no local requirement ─────────────────────────────
  if (isGlobal || !country) {
    return {
      score: 80,
      issues: [],
      strengths: ['Content targets a global or unspecified audience — no local context requirements apply.'],
      label: 'Local Relevance',
      icon: 'MapPin',
      note: 'Global project — local scoring not applicable.',
    }
  }

  // ── Non-Singapore local market ──────────────────────────────────────────────
  if (!isSG && country) {
    const mentions = countOccurrences(body, country)
    if (mentions >= 3) {
      pts = 88
      strengths.push(`Content references ${country} ${mentions} times — provides clear local market grounding.`)
    } else if (mentions >= 1) {
      pts = 62
      issues.push(issue(
        `"${country}" appears only ${mentions} time in the content — insufficient for a page targeting a ${country} audience.`,
        `Add 2–3 more ${country}-specific references: local market conditions, regulatory context, or audience-specific considerations. Local specificity significantly improves relevance and trust.`,
        26, 'Local'
      ))
    } else {
      pts = 35
      issues.push(issue(
        `Content doesn't mention ${country} at all. For a local market article, the complete absence of local context reduces relevance and trust.`,
        `Add at least one paragraph addressing the ${country} market specifically — regulations, conditions, or practical considerations for your local audience.`,
        53, 'Local'
      ))
    }
    return { score: Math.min(Math.round(pts), 100), issues, strengths, label: 'Local Relevance', icon: 'MapPin' }
  }

  // ── Singapore content — full industry-aware check ──────────────────────────
  // Scoring: general SG presence (20) + industry-specific terms (50) + grants + regulatory (30)

  // General SG presence — 20 pts
  const sgMentions = (body.match(RE_SG_GENERAL) || []).length
  if (sgMentions >= 4) {
    pts += 20
    strengths.push(`Content references Singapore context ${sgMentions} times — strong local grounding throughout.`)
  } else if (sgMentions >= 2) {
    pts += 12
    issues.push(issue(
      `Singapore is mentioned ${sgMentions} times — present, but more local context would strengthen credibility for SG readers.`,
      `Add 2–3 more Singapore-specific references — market dynamics, regulatory environment, or local buyer behaviour.`,
      8, 'Local'
    ))
  } else if (sgMentions >= 1) {
    pts += 6
    issues.push(issue(
      `Singapore is only mentioned once. For content aimed at Singapore readers, a single mention is insufficient to establish local relevance.`,
      `Add multiple Singapore references: in the introduction, at least one body section, and the conclusion. Reference the SG market context specifically.`,
      14, 'Local'
    ))
  } else {
    issues.push(issue(
      `"Singapore" doesn't appear in the content at all. Content with no local reference feels generic to Singapore readers.`,
      `Add explicit Singapore references throughout — in the intro, in at least one body section, and in the conclusion.`,
      20, 'Local'
    ))
  }

  // Industry-specific SG terms — 50 pts
  const svcInd = (services + ' ' + industry).toLowerCase()
  let industryLabel, termsFound, termsNeeded, hint

  if (/hr|human resource|payroll|recruitment|hiring|talent|employee|workforce/.test(svcInd)) {
    industryLabel = 'HR and employment'
    termsFound    = (body.match(RE_SG_HR) || []).length
    termsNeeded   = 3
    hint          = 'MOM regulations, CPF contribution rules, Employment Pass/S Pass requirements, Employment Act provisions, or Fair Consideration Framework'
  } else if (/finance|accounting|fintech|payment|invoice|tax|gst|audit|bookkeeping/.test(svcInd)) {
    industryLabel = 'finance and compliance'
    termsFound    = (body.match(RE_SG_FINANCE) || []).length
    termsNeeded   = 3
    hint          = 'IRAS filing requirements, GST registration thresholds, ACRA reporting deadlines, MAS regulations, or XBRL financial reporting'
  } else if (/saas|software|tech|digital|cloud|platform|app|system|data|automation/.test(svcInd)) {
    industryLabel = 'technology and digital'
    termsFound    = (body.match(RE_SG_TECH) || []).length
    termsNeeded   = 2
    hint          = 'PDPA compliance requirements, IMDA SMEs Go Digital programme, MAS TRM guidelines, or Digital Resilience Bonus'
  } else {
    industryLabel = 'general SME / business'
    termsFound    = (body.match(RE_SG_SME) || []).length
    termsNeeded   = 2
    hint          = 'Productivity Solutions Grant (PSG), Enterprise Development Grant (EDG), SkillsFuture Enterprise Credit, or Enterprise Singapore programmes'
  }

  if (termsFound >= termsNeeded) {
    pts += 50
    strengths.push(`Content includes ${termsFound} specific Singapore ${industryLabel} terms — demonstrates genuine local market knowledge that generic content cannot replicate.`)
  } else if (termsFound >= 1) {
    pts += 25
    issues.push(issue(
      `Content includes ${termsFound} Singapore ${industryLabel} reference${termsFound > 1 ? 's' : ''} — present, but not enough to establish deep local credibility.`,
      `Add ${termsNeeded - termsFound} more Singapore-specific ${industryLabel} references. For example: ${hint}. This is what separates locally authoritative content from generic articles.`,
      25, 'Local'
    ))
  } else {
    issues.push(issue(
      `No Singapore-specific ${industryLabel} regulations or context found. For an SG audience, the absence of local technical knowledge is a significant credibility gap.`,
      `Add at least ${termsNeeded} Singapore ${industryLabel} references. For example: ${hint}. A brief paragraph of local context can dramatically improve relevance and authority.`,
      50, 'Local'
    ))
  }

  // Grants + regulatory balance — 30 pts
  const grantMentions = (body.match(RE_SG_SME) || []).length
  const regMentions   = (body.match(RE_SG_HR) || []).length + (body.match(RE_SG_FINANCE) || []).length + (body.match(RE_SG_TECH) || []).length

  if (grantMentions >= 1 && regMentions >= 1) {
    pts += 30
    strengths.push('Content addresses both Singapore government support programmes (grants) and regulatory obligations — a genuinely useful combination for local SME readers.')
  } else if (grantMentions >= 1) {
    pts += 17
    issues.push(issue(
      `Content mentions grants or government programmes but doesn't address the regulatory dimension. Singapore readers benefit from understanding both the opportunity and the obligation.`,
      `Add a brief mention of the regulatory context relevant to your service area — e.g., MOM rules for HR content, or IRAS requirements for finance content.`,
      13, 'Local'
    ))
  } else if (regMentions >= 2) {
    pts += 17
    issues.push(issue(
      `Content addresses regulatory context but misses a key opportunity to mention relevant Singapore grants or support programmes.`,
      `Add a short callout mentioning applicable grants — PSG, EDG, SkillsFuture, or relevant IMDA/EnterpriseSG programmes. Singapore SME readers actively look for this information.`,
      13, 'Local'
    ))
  } else {
    issues.push(issue(
      `Content doesn't mention Singapore grants or regulatory context. For a Singapore SME audience, a brief mention of government support (PSG, EDG, etc.) adds immediate practical value and builds local authority.`,
      `Add a short paragraph: "Singapore businesses investing in [service] may be eligible for the Productivity Solutions Grant (PSG) or Enterprise Development Grant (EDG)." Then briefly note the relevant regulatory environment.`,
      30, 'Local'
    ))
  }

  return { score: Math.min(Math.round(pts), 100), issues, strengths, label: 'Local Relevance', icon: 'MapPin' }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. INTERNAL LINKS  — 12 % of overall
// ═══════════════════════════════════════════════════════════════════════════════

function scoreInternalLinks(content, brief) {
  const { body = '' } = content
  const issues    = []
  const strengths = []
  let   pts       = 0

  // ── Brief has link suggestions ────────────────────────────────── 25 pts ──
  const briefLinkCount = brief?.internalLinks?.length || 0
  if (briefLinkCount >= 4) {
    pts += 25
    strengths.push(`Content brief includes ${briefLinkCount} internal link suggestions — a solid foundation for building site architecture.`)
  } else if (briefLinkCount >= 2) {
    pts += 15
    issues.push(issue(
      `Only ${briefLinkCount} internal links are suggested in the brief. More variety strengthens site crawlability and the reader's navigational journey.`,
      `Regenerate your content brief, or manually identify 3–5 additional internal link targets — service pages, related articles, and the contact page are the highest priority.`,
      10, 'Links'
    ))
  } else if (briefLinkCount === 1) {
    pts += 7
    issues.push(issue(
      `Only 1 internal link is suggested in the brief. Internal linking is one of the highest-leverage on-page SEO activities.`,
      `Identify at least 4 pages on your site relevant to this article: your main service page, 2 related blog posts, and your contact or enquiry page.`,
      18, 'Links'
    ))
  } else {
    issues.push(issue(
      `No internal link suggestions exist in the content brief.`,
      `Generate or edit the content brief to include internal link suggestions. Alternatively, manually identify your top service pages, related articles, and contact page to link from this content.`,
      25, 'Links'
    ))
  }

  // ── Links in body ─────────────────────────────────────────────── 35 pts ──
  const mdLinks    = (body.match(/\[.+?\]\([^)]+\)/g) || []).length
  const linkHints  = (body.match(/\b(see also|read more|visit our|check our|our .{0,20} page|more in our)\b/gi) || []).length
  const totalLinks = mdLinks + Math.min(linkHints, 3)

  if (totalLinks >= 4) {
    pts += 35
    strengths.push(`${totalLinks} internal link references in the body — good for distributing link equity and improving reader navigation.`)
  } else if (totalLinks >= 2) {
    pts += 20
    issues.push(issue(
      `Only ${totalLinks} internal link${totalLinks > 1 ? 's' : ''} found in the body. A well-optimised article typically has 4–6 contextual internal links.`,
      `Add 2–3 more internal links where they naturally fit the content — not forced at the end, but woven into relevant sentences.`,
      15, 'Links'
    ))
  } else if (totalLinks >= 1) {
    pts += 10
    issues.push(issue(
      `Only ${totalLinks} internal link in the body. This is well below the recommended 4–6 links for a standard SEO article.`,
      `Add at least 3 more internal links using descriptive anchor text. Use the link suggestions from your content brief as the starting point.`,
      25, 'Links'
    ))
  } else {
    issues.push(issue(
      `No internal links detected in the content body. Internal links help search engines discover and understand your site, and guide readers to related pages.`,
      `Add at least 4 internal links: your main service page, 2 related blog posts or guides, and your contact/enquiry page. Use descriptive anchor text for each.`,
      35, 'Links'
    ))
  }

  // ── Anchor text quality ───────────────────────────────────────── 20 pts ──
  const poorAnchors = (body.match(/\[(click here|here|link|this page|read more)\]\(/gi) || []).length
  const mdTexts     = (body.match(/\[([^\]]+)\]\(/g) || []).map(m => m.slice(1, -2))
  const hasDescriptive = mdTexts.some(t => t.split(' ').length >= 2 && !['click here','here','link','read more'].includes(t.toLowerCase()))

  if (poorAnchors === 0 && hasDescriptive) {
    pts += 20
    strengths.push('Internal link anchor text is descriptive and keyword-relevant — passes meaningful signals to search engines.')
  } else if (poorAnchors === 0) {
    pts += 12
    issues.push(issue(
      `Links are present but anchor text could be more descriptive and keyword-rich.`,
      `Use anchor text that naturally describes the destination page — e.g., "our HR software for Singapore SMEs" instead of "our software". This provides context to both readers and search engines.`,
      8, 'Links'
    ))
  } else {
    pts += 4
    issues.push(issue(
      `${poorAnchors} link${poorAnchors > 1 ? 's use' : ' uses'} generic anchor text ("click here", "here", etc.) — this is a missed SEO signal.`,
      `Replace all generic anchor text with descriptive phrases. Compare: "click here" vs "learn more about our payroll services for Singapore SMEs." The second version is clearer and more useful for SEO.`,
      16, 'Links'
    ))
  }

  // ── Contact / enquiry path ────────────────────────────────────── 20 pts ──
  const hasContactRef = /\[.{0,50}(contact|enquir|get in touch|book|schedule|reach out).{0,20}\]\(/i.test(body) ||
                        /\b(contact us|get in touch|book a call|reach out to us|schedule a call|speak to our team)\b/i.test(body)
  if (hasContactRef) {
    pts += 20
    strengths.push('Content links to or clearly directs readers toward a contact/enquiry path — essential for lead generation.')
  } else {
    issues.push(issue(
      `No clear reference to a contact page or enquiry path found. Readers who are ready to act need an obvious next step.`,
      `Add a contextual reference to your contact page or enquiry process — at least once in the body and once in the conclusion. This is the most direct lever for converting readers into leads.`,
      20, 'Links'
    ))
  }

  return { score: Math.min(Math.round(pts), 100), issues, strengths, label: 'Internal Links', icon: 'Link' }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. CONVERSION  — 15 % of overall
// ═══════════════════════════════════════════════════════════════════════════════

function scoreConversion(content, brief, ctx) {
  const { body = '' } = content
  const { funnel, pageType } = ctx
  const isServicePage = /service|landing/i.test(pageType)
  const isBOFU  = funnel === 'BOFU'
  const isMOFU  = funnel === 'MOFU'
  const issues  = []
  const strengths = []
  let   pts     = 0

  // ── CTA section present ─────────────────────────────────────────── 25 pts ──
  const hasCTAH2   = /##\s+.*(next step|get started|ready|contact|work with|book|schedule|move forward|take action)/i.test(body)
  const hasCTAText = /\b(book a|schedule a|contact us|get in touch|get a quote|free consultation|reach out|speak to|get started today|request a)\b/i.test(body)

  if (hasCTAH2 || hasCTAText) {
    pts += 25
    strengths.push('Clear CTA is present — readers have a defined next step to take.')
  } else {
    issues.push(issue(
      `No clear call-to-action found. Content without a CTA is a missed lead generation opportunity — even educational content should give readers a way to take the next step.`,
      `Add a conclusion section with a specific, stage-appropriate CTA. ${isBOFU ? 'For decision-stage content: "Book a Free 30-Minute Discovery Call."' : isMOFU ? 'For consideration-stage content: "Schedule a No-Obligation Consultation."' : 'For educational content: "If you\'d like a free second opinion on your current setup, we\'re easy to reach."'}`,
      25, 'Conversion'
    ))
  }

  // ── CTA matches funnel stage ─────────────────────────────────────── 20 pts ──
  const strongCTA  = (body.match(/\b(book|hire|schedule|get a quote|custom quote|enquire|enquiry|buy now|get started|sign up|free trial|request a)\b/gi) || []).length
  const softCTA    = (body.match(/\b(download|read more|subscribe|learn more|explore|find out|sign up for free)\b/gi) || []).length
  const consultCTA = (body.match(/\b(consultation|strategy call|discovery call|free call|free review|free assessment|no obligation|30.minute)\b/gi) || []).length

  if ((isBOFU || (isBOFU && isServicePage)) && (strongCTA >= 2 || (strongCTA >= 1 && consultCTA >= 1))) {
    pts += 20
    strengths.push('Strong transactional CTAs match the decision-stage (BOFU) context — readers ready to act have a clear path.')
  } else if (isBOFU && (strongCTA >= 1 || consultCTA >= 1)) {
    pts += 12
    issues.push(issue(
      `BOFU content has a CTA, but it could be stronger. Decision-stage readers are ready to act — the path to engage should be unmistakable.`,
      `Strengthen the CTA: "Book a Free 30-Minute Strategy Call" is more compelling than "Contact Us." Add a second CTA mid-article — don't wait until the end.`,
      8, 'Conversion'
    ))
  } else if (isMOFU && (consultCTA >= 1 || softCTA >= 1 || strongCTA >= 1)) {
    pts += 20
    strengths.push('CTA matches the consideration-stage (MOFU) context — inviting without being premature.')
  } else if (isMOFU) {
    issues.push(issue(
      `MOFU content needs a CTA that matches the evaluation mindset — the reader is comparing, not yet ready to commit.`,
      `Add a consultation or comparison offer: "Book a Free 30-Minute Consultation to Discuss Your Options" or "Download Our Evaluation Checklist." Match the offer to the reader's stage.`,
      20, 'Conversion'
    ))
  } else if (!isBOFU && !isMOFU && (softCTA >= 1 || consultCTA >= 1 || strongCTA >= 1)) {
    pts += 20
    strengths.push('CTA is appropriate for educational (TOFU) content — inviting further engagement without being pushy.')
  } else if (!isBOFU && !isMOFU) {
    issues.push(issue(
      `Educational content should still have a soft CTA — readers who engage with your content are warm leads worth nurturing.`,
      `Add a low-friction CTA at the end: "If you'd like a free second opinion on your current setup, we're easy to reach" or "Subscribe for more guides like this."`,
      20, 'Conversion'
    ))
  } else {
    issues.push(issue(
      `Content is missing a CTA appropriate for its funnel stage.`,
      `Add a CTA that matches the reader's stage: strong and direct for BOFU, consultative for MOFU, and soft/educational for TOFU.`,
      20, 'Conversion'
    ))
  }

  // ── CTA specificity ────────────────────────────────────────────── 20 pts ──
  const isSpecific = consultCTA >= 1 || (strongCTA >= 1 && /\b(free|30.minute|30 minute|no obligation|custom|tailored|personalised|personalized)\b/i.test(body))
  const isVague    = /\b(contact us|get in touch)\b/i.test(body) && strongCTA <= 1 && consultCTA === 0

  if (isSpecific) {
    pts += 20
    strengths.push('CTA is specific and includes a clear benefit or offer — far more compelling than a generic "contact us."')
  } else if (hasCTAText && !isVague) {
    pts += 12
    issues.push(issue(
      `CTA exists but could be more specific. A clear offer consistently outperforms a vague prompt.`,
      `Add a benefit to the CTA: "Book a Free 30-Minute Call" beats "Get in Touch." Add specificity: time commitment, what the reader will receive, and that there's no obligation.`,
      8, 'Conversion'
    ))
  } else {
    issues.push(issue(
      `CTA is either missing or too vague. "Contact us" consistently underperforms specific, benefit-led offers.`,
      `Rewrite your CTA with a clear offer: "Book a Free 30-Minute Review" or "Get a No-Obligation Quote." Specificity is the single biggest lever for improving CTA conversion rates.`,
      20, 'Conversion'
    ))
  }

  // ── Trust signals ─────────────────────────────────────────────── 20 pts ──
  const trustCount = (body.match(/\b(client|clients|result|results|experience|experienced|specialist|specialists|expert|experts|case study|testimonial|certified|proven|track record|years?|portfolio|helped|businesses we.ve)\b/gi) || []).length
  if (trustCount >= 6) {
    pts += 20
    strengths.push('Content includes multiple trust signals — experience, outcomes, and credibility markers are clearly present.')
  } else if (trustCount >= 3) {
    pts += 12
    issues.push(issue(
      `Content has some trust signals but could do more to establish credibility. Readers evaluating a service need concrete reasons to trust the provider.`,
      `Add specific trust indicators: years of experience, number of clients served, tangible outcomes (e.g., "clients typically save X hours per week"), or reference to notable credentials.`,
      8, 'Conversion'
    ))
  } else {
    issues.push(issue(
      `Content has very few trust signals. Without credibility indicators, readers have no concrete reason to choose your business over alternatives.`,
      `Add trust signals: "We've worked with 50+ SMEs in Singapore", "Our clients typically see X within Y months", or mention relevant experience. Specific claims are far more credible than "experienced team."`,
      20, 'Conversion'
    ))
  }

  // ── Next step clarity ────────────────────────────────────────── 15 pts ──
  const nextStepCount = (body.match(/\b(next step|the next step|get started|if you.re ready|ready to|take the first|to begin|first step is)\b/gi) || []).length
  if (nextStepCount >= 2) {
    pts += 15
    strengths.push('Content reinforces the next step at multiple points — keeps the reader\'s path clear throughout.')
  } else if (nextStepCount >= 1) {
    pts += 8
    issues.push(issue(
      `"Next step" is signposted once — reinforcing it at a second point would improve conversion.`,
      `Add a "next step" prompt mid-article after your strongest persuasive section. It doesn't need to be a hard sell: "If this resonates, a 30-minute call is the fastest way to get a clear answer" is enough.`,
      7, 'Conversion'
    ))
  } else {
    issues.push(issue(
      `Content doesn't clearly state what the reader should do next. Without explicit direction, most readers leave without taking action — even if they found the content valuable.`,
      `Add at least two next-step prompts: one after a key section and one at the end. Be direct: "The best next step is a short discovery call" is clearer than "feel free to reach out."`,
      15, 'Conversion'
    ))
  }

  return { score: Math.min(Math.round(pts), 100), issues, strengths, label: 'Conversion Potential', icon: 'TrendingUp' }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. READABILITY  — 18 % of overall
// ═══════════════════════════════════════════════════════════════════════════════

function scoreReadability(content, brief, ctx) {
  const { body = '' } = content
  const issues    = []
  const strengths = []
  let   pts       = 0

  // ── Average sentence length ─────────────────────────────────────── 25 pts ──
  const avgLen = avgSentenceLength(body)
  if (avgLen > 0 && avgLen <= 18) {
    pts += 25
    strengths.push(`Average sentence length is ${avgLen} words — easy to read for busy business professionals who scan before they commit.`)
  } else if (avgLen <= 22) {
    pts += 17
    issues.push(issue(
      `Average sentence length is ${avgLen} words — slightly above the ideal for business content (under 18 words is the target).`,
      `Review the content and split sentences that contain "and", "which", or "but" in the middle. Short sentences are cleaner, faster to read, and easier to scan.`,
      8, 'Readability'
    ))
  } else if (avgLen <= 28) {
    pts += 8
    issues.push(issue(
      `Average sentence length is ${avgLen} words — noticeably long for business content. Longer sentences increase cognitive load and reduce comprehension, especially for non-native readers.`,
      `Target an average of 15–18 words per sentence. Go paragraph by paragraph and split the long ones. If you run out of breath reading a sentence aloud, split it.`,
      17, 'Readability'
    ))
  } else if (avgLen > 28) {
    pts += 3
    issues.push(issue(
      `Average sentence length is ${avgLen} words — significantly too long for business readers who scan content on screen.`,
      `This requires a substantial editing pass. Read each paragraph aloud. Every sentence that takes more than one breath to read should be split into two. Aim for an average of under 20 words.`,
      22, 'Readability'
    ))
  } else {
    pts += 15 // No sentences detected — neutral score
  }

  // ── Long paragraphs ─────────────────────────────────────────────── 20 pts ──
  const longParas = longParagraphCount(body, 90)
  if (longParas === 0) {
    pts += 20
    strengths.push('No overly long paragraphs — content is well-broken for screen reading.')
  } else if (longParas <= 2) {
    pts += 12
    issues.push(issue(
      `${longParas} paragraph${longParas > 1 ? 's are' : ' is'} over 90 words. Long paragraphs are visually intimidating on screen and cause readers to skip key points.`,
      `Break long paragraphs at a natural point — typically where you transition from one idea to a second. Aim for a maximum of 4 sentences per paragraph.`,
      8, 'Readability'
    ))
  } else {
    pts += 4
    issues.push(issue(
      `${longParas} paragraphs are over 90 words — this is a recurring pattern throughout the content. Business readers skim; dense blocks get skipped.`,
      `Go through the content and break every paragraph over 4 sentences. This is one of the fastest, highest-impact readability edits you can make.`,
      16, 'Readability'
    ))
  }

  // ── Heading depth (H2 + H3) ─────────────────────────────────────── 20 pts ──
  const totalHeadings = getH2Count(body) + getH3Count(body)
  if (totalHeadings >= 7) {
    pts += 20
    strengths.push(`Strong heading structure (${totalHeadings} headings) — readers can navigate to what's most relevant to them.`)
  } else if (totalHeadings >= 5) {
    pts += 14
    issues.push(issue(
      `${totalHeadings} headings found — good coverage, but adding H3 sub-headings inside longer sections would improve navigation further.`,
      `Add H3 sub-headings inside any section over 200 words. Breaking longer sections into subsections helps readers find specific information quickly.`,
      6, 'Readability'
    ))
  } else if (totalHeadings >= 3) {
    pts += 8
    issues.push(issue(
      `Only ${totalHeadings} headings found. Without sufficient structure, the content reads as one long block — readers who scan for relevance before reading deeply can't do so.`,
      `Add H2 headings for all major sections and H3 sub-headings inside longer ones. Aim for a heading approximately every 200–250 words.`,
      12, 'Readability'
    ))
  } else {
    issues.push(issue(
      `Very few headings (${totalHeadings}) found — content lacks visible structure. This is one of the most critical readability issues in business content.`,
      `Add H2 headings for every major section immediately. This single change will transform how readable and navigable the content feels.`,
      20, 'Readability'
    ))
  }

  // ── Lists (bullet and numbered) ─────────────────────────────────── 20 pts ──
  const bullets   = bulletCount(body)
  const numbered  = numberedListCount(body)
  const listTotal = bullets + numbered
  if (listTotal >= 8) {
    pts += 20
    strengths.push(`Strong use of lists (${listTotal} items across bullets and numbered lists) — key information is scannable and easy to process.`)
  } else if (listTotal >= 4) {
    pts += 13
    issues.push(issue(
      `${listTotal} list items found — lists are present, but more would improve scannability. Business readers strongly prefer structured formats for key points.`,
      `Look for sentences where you list 3+ items separated by commas — convert them to bullet points. Convert any "Step 1, Step 2, Step 3" text to a numbered list.`,
      7, 'Readability'
    ))
  } else if (listTotal >= 1) {
    pts += 6
    issues.push(issue(
      `Only ${listTotal} list item${listTotal > 1 ? 's' : ''} found. Business readers have a strong preference for structured, visual formats — prose-only content is harder to skim.`,
      `Identify every section that describes 3 or more related items and convert them to bullet points. Benefits, features, process steps, and key considerations should all be lists.`,
      14, 'Readability'
    ))
  } else {
    issues.push(issue(
      `No bullet points or numbered lists found. This is a significant readability gap — lists are one of the most effective structural tools in business content.`,
      `Convert all multi-item descriptions to lists. Any sentence with "first..., second..., and third..." or "there are three things..." should be a numbered or bulleted list.`,
      20, 'Readability'
    ))
  }

  // ── Text walls (large gaps between structural elements) ──────────── 15 pts ──
  if (!hasTextWalls(body)) {
    pts += 15
    strengths.push('No text walls detected — content is well-broken between sections and structure elements.')
  } else {
    pts += 4
    issues.push(issue(
      `One or more sections appear to have 280+ words without a heading, list, or visual break — creating a "text wall" that readers avoid engaging with.`,
      `Find the longest unbroken text block and add an H3 sub-heading in the middle, or convert part of it to a bullet list. No section should require a reader to scroll through more than ~250 words without a structural break.`,
      11, 'Readability'
    ))
  }

  return { score: Math.min(Math.round(pts), 100), issues, strengths, label: 'Readability', icon: 'BookOpen' }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLISH READINESS
// Based on overall score + count of high-impact issues (≥ 15 pts)
// ═══════════════════════════════════════════════════════════════════════════════

function getPublishReadiness(overall, allScores) {
  const hasPlaceholders = allScores.some(s => s.hasPlaceholders)
  if (hasPlaceholders) return { label: 'Not Ready — Fix Placeholders', color: 'red', emoji: '⚠️' }
  const bigIssues = allScores.flatMap(s => (s.issues || []).filter(i => i.pts >= 15)).length
  if (overall >= 82 && bigIssues === 0) return { label: 'Ready to Publish',         color: 'green',  emoji: '🚀' }
  if (overall >= 70 && bigIssues <= 2)  return { label: 'Needs Minor Edits',         color: 'blue',   emoji: '✏️' }
  if (overall >= 52)                    return { label: 'Needs Major Improvement',   color: 'amber',  emoji: '⚠️' }
  return                                       { label: 'Not Ready',                 color: 'red',    emoji: '🔧' }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STRENGTHS COLLECTOR — top 6 positive signals across all dimensions
// ═══════════════════════════════════════════════════════════════════════════════

function collectStrengths(allScores) {
  return allScores.flatMap(s => s.strengths || []).slice(0, 6)
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRIORITY FIX RANKER — surfaces the 4 highest-impact issues by pts value
// ═══════════════════════════════════════════════════════════════════════════════

function rankPriorityFixes(allScores) {
  return allScores
    .flatMap(s => (s.issues || []).map(i => ({ ...i, category: i.cat || s.label })))
    .sort((a, b) => b.pts - a.pts)
    .slice(0, 4)
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORTED SCORER
//
// Signature: scoreContent(content, brief, project = null)
//   - content : object from generatedContent[]
//   - brief   : object from briefs[]
//   - project : (optional) full project object for richer local scoring
//
// Backward-compatible: existing calls with 2 args work without change.
// New calls can pass project as 3rd arg for more accurate local relevance scoring.
// ═══════════════════════════════════════════════════════════════════════════════

export function scoreContent(content, brief, project = null) {
  // Prefer focusKeyphrase from brief; fall back to targetKeyword
  const enrichedBrief = brief
    ? { ...brief, targetKeyword: brief.focusKeyphrase || brief.targetKeyword }
    : brief
  const ctx = deriveCtx(content, enrichedBrief, project)

  const seo         = scoreSEOReadiness(content, enrichedBrief, ctx)
  const helpful     = scoreHelpfulContent(content, enrichedBrief, ctx)
  const local       = scoreLocalRelevance(content, enrichedBrief, ctx)
  const links       = scoreInternalLinks(content, enrichedBrief)
  const conversion  = scoreConversion(content, enrichedBrief, ctx)
  const readability = scoreReadability(content, enrichedBrief, ctx)

  const allScores = [seo, helpful, local, links, conversion, readability]

  // Weighted overall — weights sum to 100%
  const overall = Math.min(100, Math.round(
    seo.score         * 0.25 +
    helpful.score     * 0.22 +
    local.score       * 0.08 +
    readability.score * 0.18 +
    conversion.score  * 0.15 +
    links.score       * 0.12
  ))

  const publishReadiness  = getPublishReadiness(overall, allScores)
  const strengths         = collectStrengths(allScores)
  const priorityFixes     = rankPriorityFixes(allScores)
  const structuredIssues  = allScores.flatMap(s =>
    (s.issues || []).map(i => ({ ...(typeof i === 'string' ? { msg: i, fix: '', pts: 0 } : i) }))
  )

  // Flat string array — required for backward-compatible UI rendering
  // Format: "Issue message → How to fix it" (readable as a single line)
  const issues = allScores.flatMap(s =>
    (s.issues || []).map(i =>
      typeof i === 'string'
        ? i
        : i.fix ? `${i.msg} → ${i.fix}` : i.msg
    )
  )

  const grade = { label: publishReadiness.label, color: publishReadiness.color }

  return {
    // ── Backward-compatible fields (used by current UI) ──────────────────────
    id:         generateId(),
    contentId:  content.id,
    briefId:    brief?.id,
    keyword:    content.targetKeyword,
    overall,
    grade,
    breakdown: {
      seo:         seo.score,
      helpful:     helpful.score,
      links:       links.score,
      conversion:  conversion.score,
      readability: readability.score,
      // 6th key — ignored by current UI SCORE_META but available for future use
      local:       local.score,
    },
    issues,
    wordCount:  countWords(content.body || ''),
    scoredAt:   new Date().toISOString(),

    // ── New enriched fields (used by upgraded UI or future features) ─────────
    publishReadiness,
    strengths,
    priorityFixes,
    structuredIssues,
    localNote: local.note || null,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR HELPER — unchanged; backward-compatible
// ═══════════════════════════════════════════════════════════════════════════════

export function getScoreColor(score) {
  if (score >= 85) return { text: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300', ring: '#16a34a' }
  if (score >= 70) return { text: 'text-blue-600',  bg: 'bg-blue-100',  border: 'border-blue-300',  ring: '#2563eb' }
  if (score >= 55) return { text: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-300', ring: '#d97706' }
  return               { text: 'text-red-600',  bg: 'bg-red-100',  border: 'border-red-300',  ring: '#dc2626' }
}
