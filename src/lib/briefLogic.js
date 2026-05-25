import { generateId, slugify } from './storage'

// ─── H2 structure by intent & funnel ─────────────────────────────────────────

function buildH2s(keyword, intent, funnel, services, audience) {
  const kw  = keyword.toLowerCase()
  const svc = (services || '').split(',')[0]?.trim() || 'service'
  const aud = (audience || '').split(',')[0]?.trim() || 'your business'

  const tofu = [
    `What Is ${titleCase(kw)}? A Clear Definition`,
    `Why ${titleCase(svc)} Matters for ${titleCase(aud)}`,
    `Key Benefits of ${titleCase(kw)}`,
    `How ${titleCase(kw)} Works — Step by Step`,
    `Common Mistakes to Avoid with ${titleCase(svc)}`,
    `How to Get Started with ${titleCase(svc)}`,
    `Frequently Asked Questions`,
    `Next Steps`,
  ]

  const mofu = [
    `What to Look For in ${titleCase(kw)}`,
    `Key Features That Actually Matter`,
    `How to Evaluate Your Options`,
    `The Hidden Costs of Getting This Wrong`,
    `What the Best ${titleCase(svc)} Solutions Have in Common`,
    `How to Build Your Shortlist`,
    `Frequently Asked Questions`,
    `Ready to Move Forward?`,
  ]

  const bofu = [
    `What ${titleCase(kw)} Includes`,
    `Our Process: What to Expect`,
    `Who This Is For`,
    `Why Businesses Choose Us`,
    `Pricing and Engagement Models`,
    `Frequently Asked Questions`,
    `Get Started Today`,
  ]

  if (funnel === 'TOFU') return tofu
  if (funnel === 'MOFU') return mofu
  return bofu
}

// ─── FAQ generation ───────────────────────────────────────────────────────────

function buildFAQs(keyword, intent, funnel, services, audience, companyName) {
  const kw      = keyword.toLowerCase()
  const svc     = (services || '').split(',')[0]?.trim() || 'our service'
  const aud     = (audience || '').split(',')[0]?.trim() || 'businesses'
  const company = companyName || 'our team'

  const tofuFAQs = [
    { q: `What is ${kw}?`,                        a: `${titleCase(kw)} refers to the practice of [add your definition here]. For ${aud}, it means [specific impact].` },
    { q: `Why is ${svc} important for ${aud}?`,   a: `${titleCase(svc)} helps ${aud} [key benefit]. Without it, [common problem].` },
    { q: `How long does ${svc} take to set up?`,  a: `Most ${aud} can get started within [timeframe]. ${company} typically onboards new clients in [specific time].` },
    { q: `How much does ${svc} cost?`,             a: `Costs vary based on [factors]. ${company} offers [pricing overview]. Contact us for a tailored quote.` },
    { q: `Can I do ${kw} in-house or do I need help?`, a: `Many ${aud} start in-house, but as you scale, working with a specialist like ${company} saves time and reduces errors.` },
    { q: `What results can I expect from ${svc}?`,  a: `Results depend on your starting point, but ${aud} working with ${company} typically see [outcome] within [timeframe].` },
  ]

  const mofuFAQs = [
    { q: `What should I look for in ${kw}?`,            a: `Focus on [key criterion 1], [key criterion 2], and [key criterion 3]. Avoid providers who [red flag].` },
    { q: `How does ${company} compare to alternatives?`, a: `Unlike generic options, ${company} specialises in ${svc} for ${aud} — meaning you get [specific advantage].` },
    { q: `What's the typical contract or commitment?`,   a: `${company} offers [contract type]. Most clients start with [engagement model] before scaling.` },
    { q: `Do I need any technical knowledge?`,           a: `No. ${company} handles [technical aspects]. You just need to [simple requirement].` },
    { q: `What is your onboarding process?`,             a: `We start with a discovery call, then [step 2], then [step 3]. You'll have a clear roadmap within [timeframe].` },
    { q: `Can you work with my existing tools?`,        a: `Yes. ${company} integrates with [common tools]. We'll assess your current setup in our initial consultation.` },
  ]

  const bofuFAQs = [
    { q: `How quickly can we get started?`,             a: `Once you reach out, we typically schedule a discovery call within [timeframe] and begin work within [timeframe].` },
    { q: `What's included in your ${svc} package?`,    a: `Our ${svc} includes [deliverable 1], [deliverable 2], and [deliverable 3]. We'll customise based on your needs.` },
    { q: `Do you offer a free consultation?`,           a: `Yes. Book a free 30-minute strategy call with ${company} to discuss your ${svc} needs and get a tailored plan.` },
    { q: `What happens if I'm not satisfied?`,          a: `${company} works closely with clients throughout every engagement. We have a [satisfaction policy].` },
    { q: `Do you work with businesses in [country]?`,  a: `Yes, ${company} works with ${aud} across [locations]. [Details about local support or remote capabilities].` },
    { q: `How do you measure success?`,                 a: `We agree on KPIs at the start — typically [example metrics] — and report on progress [reporting cadence].` },
  ]

  if (funnel === 'TOFU') return tofuFAQs
  if (funnel === 'MOFU') return mofuFAQs
  return bofuFAQs
}

// ─── Meta generation ──────────────────────────────────────────────────────────

function buildMeta(keyword, companyName, country) {
  const kw      = titleCase(keyword)
  const company = companyName || 'Your Company'
  const loc     = country && country !== 'Global / Remote' ? ` in ${country}` : ''

  // Keep title ≤ 60 chars
  let title = `${kw} | ${company}`
  if (title.length > 60) title = `${kw} — ${company}`.slice(0, 57) + '...'

  // Keep description ≤ 160 chars
  let desc = `Discover how ${kw.toLowerCase()} can help your business grow${loc}. Expert guidance from ${company}. Read the full guide.`
  if (desc.length > 160) desc = desc.slice(0, 157) + '...'

  return { title, description: desc }
}

// ─── CTA generation ───────────────────────────────────────────────────────────

function buildCTA(funnel, services, companyName) {
  const svc     = (services || '').split(',')[0]?.trim() || 'our services'
  const company = companyName || 'us'

  const ctas = {
    TOFU: {
      heading:     `Want a Free ${titleCase(svc)} Review?`,
      body:        `Not sure where to start? ${company} offers a free 30-minute consultation to assess your current situation and recommend the right approach.`,
      buttonLabel: `Book a Free Consultation`,
    },
    MOFU: {
      heading:     `Compare Your Options — Get Expert Advice`,
      body:        `Speak with a ${titleCase(svc)} specialist at ${company}. We'll help you evaluate your options and find the best fit for your budget and goals.`,
      buttonLabel: `Schedule a Strategy Call`,
    },
    BOFU: {
      heading:     `Ready to Get Started?`,
      body:        `${company} is ready to help. Contact us today to discuss your requirements and receive a tailored proposal within 24 hours.`,
      buttonLabel: `Get a Custom Quote`,
    },
  }

  return ctas[funnel] || ctas.TOFU
}

// ─── Internal Link Suggestions ────────────────────────────────────────────────

function buildInternalLinks(project, keyword) {
  const { services = '', industry = '' } = project
  const svcList = services.split(',').map(s => s.trim()).filter(Boolean)
  const suggestions = []

  svcList.forEach(svc => {
    suggestions.push({
      anchorText:  `${svc} services`,
      suggestedURL: `/services/${slugify(svc)}`,
      relevance:   'High',
    })
    suggestions.push({
      anchorText:  `How ${svc} works`,
      suggestedURL: `/blog/how-${slugify(svc)}-works`,
      relevance:   'Medium',
    })
  })

  suggestions.push({
    anchorText:  'Contact us',
    suggestedURL: '/contact',
    relevance:   'High',
  })
  suggestions.push({
    anchorText:  'About us',
    suggestedURL: '/about',
    relevance:   'Low',
  })

  return suggestions.slice(0, 6)
}

// ─── LSI Keywords ─────────────────────────────────────────────────────────────

function buildLSI(keyword, services) {
  const svc = (services || '').split(',')[0]?.trim() || ''
  const kw  = keyword.toLowerCase()
  return [
    `${svc} solution`,
    `${svc} provider`,
    `${svc} platform`,
    `${kw} strategy`,
    `${kw} process`,
    `${kw} tools`,
    `professional ${svc}`,
  ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 6)
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function generateBrief(keywordObj, project) {
  const {
    keyword,
    intent,
    funnel,
    pageType,
  } = keywordObj

  const {
    companyName = '',
    services    = '',
    targetAudience = '',
    country     = '',
  } = project

  const primaryAud = targetAudience.split(',')[0]?.trim() || 'your target audience'
  const h2s        = buildH2s(keyword, intent, funnel, services, targetAudience)
  const faqs       = buildFAQs(keyword, intent, funnel, services, targetAudience, companyName)
  const meta       = buildMeta(keyword, companyName, country)
  const cta        = buildCTA(funnel, services, companyName)
  const links      = buildInternalLinks(project, keyword)
  const lsi        = buildLSI(keyword, services)

  const suggestedH1 = funnel === 'BOFU'
    ? `${titleCase(keyword)}: Get Expert Help from ${companyName || 'Our Team'}`
    : funnel === 'MOFU'
    ? `The Complete Guide to Choosing ${titleCase(keyword)}`
    : `${titleCase(keyword)}: What It Is and How It Helps ${titleCase(primaryAud)}`

  return {
    id:            generateId(),
    keywordId:     keywordObj.id,
    targetKeyword: keyword,
    lsiKeywords:   lsi,
    intent,
    funnel,
    pageType,
    audience:      targetAudience,
    suggestedH1,
    h2s,
    faqs,
    cta,
    internalLinks: links,
    meta,
    slug:          slugify(keyword),
    wordCountTarget: funnel === 'TOFU' ? '1,200–1,800 words' : funnel === 'MOFU' ? '1,000–1,500 words' : '800–1,200 words',
    readabilityTarget: 'Grade 8–10 reading level. Short paragraphs (3–4 sentences max). Use bullet lists for 3+ items.',
    createdAt:     new Date().toISOString(),
  }
}

// ─── Util ─────────────────────────────────────────────────────────────────────

function titleCase(str) {
  return (str || '').replace(/\w\S*/g, txt =>
    txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  )
}
