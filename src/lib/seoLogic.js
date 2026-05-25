import { generateId } from './storage'

// ─── Constants ───────────────────────────────────────────────────────────────

export const INDUSTRIES = [
  'SaaS / Software',
  'E-commerce / Retail',
  'Professional Services',
  'Healthcare / Medical',
  'Education / EdTech',
  'Finance / Fintech',
  'Real Estate',
  'Marketing / Agency',
  'HR & Recruitment',
  'Logistics & Supply Chain',
  'Manufacturing',
  'Hospitality / Travel',
  'Legal Services',
  'Other',
]

export const COUNTRIES = [
  'Malaysia',
  'Singapore',
  'Indonesia',
  'Philippines',
  'Thailand',
  'Vietnam',
  'India',
  'United States',
  'United Kingdom',
  'Australia',
  'Canada',
  'UAE / Dubai',
  'Germany',
  'Netherlands',
  'Global / Remote',
  'Other',
]

export const TONES = [
  'Professional & Authoritative',
  'Friendly & Approachable',
  'Educational & Helpful',
  'Bold & Direct',
  'Conversational & Casual',
]

export const PAGE_TYPES = {
  BLOG:       'Blog Article',
  GUIDE:      'Ultimate Guide',
  SERVICE:    'Service Page',
  LANDING:    'Landing Page',
  COMPARISON: 'Comparison Page',
  FAQ:        'FAQ Page',
  CASE_STUDY: 'Case Study',
}

// ─── Intent Detection ─────────────────────────────────────────────────────────

function detectIntent(kw) {
  const k = kw.toLowerCase()
  if (/\b(buy|hire|get started|book|schedule|quote|pricing|cost|fee|free trial|sign up|download|outsource)\b/.test(k))
    return 'Transactional'
  if (/\b(best|top|vs|compare|comparison|review|alternative|recommend|which|should i)\b/.test(k))
    return 'Commercial'
  if (/\b(what is|how to|how do|why|when|guide|tutorial|tips|benefits|types|examples|checklist|difference)\b/.test(k))
    return 'Informational'
  return 'Commercial'
}

function detectFunnel(intent) {
  if (intent === 'Informational') return 'TOFU'
  if (intent === 'Commercial')    return 'MOFU'
  return 'BOFU'
}

function scoreDifficulty(kw) {
  const k = kw.toLowerCase()
  const words = k.split(/\s+/).length
  if (/\b(what is|how to|tips for|guide to|benefits of|examples of)\b/.test(k) && words >= 4)
    return { label: 'Low', value: 25, color: 'green' }
  if (/\b(best|top|for small|for beginners|checklist|step by step)\b/.test(k))
    return { label: 'Low-Medium', value: 38, color: 'green' }
  if (/\b(vs|compare|alternative|review)\b/.test(k))
    return { label: 'High', value: 72, color: 'red' }
  if (/\b(pricing|cost|hire)\b/.test(k))
    return { label: 'Medium', value: 50, color: 'amber' }
  if (words <= 2)
    return { label: 'High', value: 78, color: 'red' }
  return { label: 'Medium', value: 48, color: 'amber' }
}

function scoreBusinessValue(funnel, intent) {
  if (funnel === 'BOFU') return 9
  if (funnel === 'MOFU') return 7
  return 4
}

function recommendPageType(intent, kw) {
  const k = kw.toLowerCase()
  if (intent === 'Transactional') {
    if (/pricing|cost|fee/.test(k)) return PAGE_TYPES.LANDING
    return PAGE_TYPES.SERVICE
  }
  if (intent === 'Commercial') {
    if (/vs|compare|alternative/.test(k)) return PAGE_TYPES.COMPARISON
    if (/best|top/.test(k))              return PAGE_TYPES.GUIDE
    return PAGE_TYPES.BLOG
  }
  // Informational
  if (/guide|complete|ultimate|everything/.test(k)) return PAGE_TYPES.GUIDE
  if (/faq|questions/.test(k))                      return PAGE_TYPES.FAQ
  return PAGE_TYPES.BLOG
}

// ─── Keyword Generation ───────────────────────────────────────────────────────

export function generateKeywords(project) {
  const { services = '', targetAudience = '', country = '', companyName = '' } = project

  const serviceList  = services.split(',').map(s => s.trim()).filter(Boolean)
  const audienceList = targetAudience.split(',').map(a => a.trim()).filter(Boolean)
  const primarySvc   = serviceList[0]?.toLowerCase() || 'services'
  const primaryAud   = audienceList[0]?.toLowerCase() || 'businesses'
  const loc          = country && country !== 'Global / Remote' ? country : ''

  const raw = new Set()

  serviceList.forEach(svc => {
    const s = svc.toLowerCase()

    // TOFU — educational
    raw.add(`what is ${s}`)
    raw.add(`how ${s} works`)
    raw.add(`benefits of ${s}`)
    raw.add(`${s} tips for ${primaryAud}`)
    raw.add(`how to improve ${s}`)
    raw.add(`${s} best practices`)
    raw.add(`${s} guide for ${primaryAud}`)
    raw.add(`${s} mistakes to avoid`)
    raw.add(`types of ${s}`)
    raw.add(`${s} checklist`)

    // MOFU — commercial
    raw.add(`best ${s} for ${primaryAud}`)
    raw.add(`top ${s} tools`)
    raw.add(`${s} software comparison`)
    raw.add(`${s} vs alternatives`)
    raw.add(`how to choose ${s}`)
    raw.add(`${s} reviews`)

    // BOFU — transactional
    raw.add(`${s} services`)
    raw.add(`${s} pricing`)
    raw.add(`hire ${s} expert`)
    raw.add(`${s} consultation`)
    raw.add(`outsource ${s}`)
    raw.add(`${s} for ${primaryAud}`)

    // Local
    if (loc) {
      raw.add(`${s} in ${loc}`)
      raw.add(`best ${s} company in ${loc}`)
      raw.add(`${s} services ${loc}`)
      raw.add(`${s} provider ${loc}`)
    }
  })

  audienceList.forEach(aud => {
    const a = aud.toLowerCase()
    raw.add(`${primarySvc} for ${a}`)
    raw.add(`${a} ${primarySvc} solutions`)
    raw.add(`how ${a} can benefit from ${primarySvc}`)
    raw.add(`${primarySvc} for ${a} guide`)
  })

  // Generic cross-cluster
  raw.add(`when to invest in ${primarySvc}`)
  raw.add(`${primarySvc} ROI`)
  raw.add(`${primarySvc} case study`)

  return [...raw]
    .filter(kw => kw.length > 5)
    .slice(0, 45)
    .map(kw => {
      const intent  = detectIntent(kw)
      const funnel  = detectFunnel(intent)
      const diff    = scoreDifficulty(kw)
      const bizVal  = scoreBusinessValue(funnel, intent)
      const pageType = recommendPageType(intent, kw)
      // Priority = (business value × 10) × 0.6 + (100 − difficulty) × 0.4
      const priority = Math.round(bizVal * 10 * 0.6 + (100 - diff.value) * 0.4)

      return {
        id: generateId(),
        keyword: kw,
        intent,
        funnel,
        difficulty: diff,
        businessValue: bizVal,
        pageType,
        priority,
        selected: false,
        hasBrief: false,
        hasContent: false,
      }
    })
    .sort((a, b) => b.priority - a.priority)
}
