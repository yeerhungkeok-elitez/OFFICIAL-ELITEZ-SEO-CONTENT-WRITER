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
    {
      q: `What is ${kw}?`,
      a: `${titleCase(kw)} is the process of systematically managing and optimising ${svc} to help ${aud} achieve consistent, scalable results. Done well, it combines clear processes, the right tools, and experienced oversight to reduce errors, save time, and support business growth.`,
    },
    {
      q: `Why is ${svc} important for ${aud}?`,
      a: `${titleCase(svc)} gives ${aud} a reliable foundation to operate from. Without it, common problems include manual errors, missed deadlines, inconsistent execution, and compliance risk. With a well-structured ${svc} approach, your team spends less time firefighting and more time on work that drives results.`,
    },
    {
      q: `How long does ${svc} take to set up?`,
      a: `Most ${aud} can see meaningful improvements within the first 30–60 days. A full ${svc} foundation — including process documentation, team alignment, and system setup — typically takes 60–90 days to implement properly. ${company} works with clients to phase this in a way that minimises disruption.`,
    },
    {
      q: `How much does ${svc} cost?`,
      a: `Costs vary based on your company size, the scope of work, and the level of support you need. Most ${aud} find that the cost is significantly offset by time saved, errors reduced, and compliance risk eliminated. Contact ${company} for a no-obligation quote tailored to your situation.`,
    },
    {
      q: `Can I do ${kw} in-house or do I need help?`,
      a: `Many ${aud} start in-house, and some manage it effectively at small scale. The challenge tends to emerge as headcount grows — when processes multiply and the cost of errors increases. Working with a specialist like ${company} gives you access to proven frameworks and experienced oversight without having to build that capability from scratch.`,
    },
    {
      q: `What results can I expect from ${svc}?`,
      a: `${aud} working with ${company} typically see measurable improvements in operational efficiency within the first two to three months — including reduced time spent on administration, fewer errors, and clearer visibility across the function. Specific outcomes depend on your starting point, which is why ${company} begins every engagement with a baseline review.`,
    },
  ]

  const mofuFAQs = [
    {
      q: `What should I look for in ${kw}?`,
      a: `Focus on three things: genuine fit for your size and industry, quality of implementation support (not just the demo), and transparent communication about limitations. Avoid providers who have a confident answer for every question — the best partners are honest about where they're strongest and where they're not.`,
    },
    {
      q: `How does ${company} compare to alternatives?`,
      a: `Unlike generic solutions, ${company} specialises in ${svc} for ${aud}. That focus means faster time to value, fewer translation layers, and a team that understands the specific challenges you're dealing with — not a playbook built for a different type of business.`,
    },
    {
      q: `What's the typical contract or commitment?`,
      a: `${company} offers flexible engagement models — from project-based work to ongoing retainers — depending on your needs and growth stage. Most clients start with a scoped engagement to establish a foundation, then move to ongoing support. There are no long lock-in periods — we'd rather earn the relationship.`,
    },
    {
      q: `Do I need any technical knowledge?`,
      a: `No. ${company} handles the technical setup and configuration. What we need from you is a clear picture of your current situation, access to the right people in your organisation, and willingness to be involved in the discovery and setup phases. Everything else is our responsibility.`,
    },
    {
      q: `What is your onboarding process?`,
      a: `We start with a discovery call to understand your current situation and goals. From there, we deliver a baseline assessment and implementation roadmap within the first two weeks. You'll know exactly what's happening, in what order, and why — before we touch anything.`,
    },
    {
      q: `Can you work with my existing tools?`,
      a: `Yes. ${company} assesses your existing tech stack in the initial consultation and builds an approach that works with what you already have wherever possible. We flag any gaps or conflicts early — so there are no integration surprises mid-engagement.`,
    },
  ]

  const bofuFAQs = [
    {
      q: `How quickly can we get started?`,
      a: `Once you reach out, we typically schedule a discovery call within 2–3 business days and can begin onboarding within two weeks of agreeing on scope. For clients with urgent timelines, we discuss what's feasible in the initial conversation.`,
    },
    {
      q: `What's included in your ${svc} package?`,
      a: `Our ${svc} engagement includes an initial baseline assessment, a customised implementation plan, hands-on delivery support, regular progress reviews, and a dedicated point of contact throughout. The exact scope is agreed before we start — no surprises mid-engagement.`,
    },
    {
      q: `Do you offer a free consultation?`,
      a: `Yes. Book a free 30-minute call with ${company} to discuss your current ${svc} situation and what a realistic improvement looks like. There's no obligation and no sales pressure — just a focused conversation about whether there's a genuine fit.`,
    },
    {
      q: `What happens if I'm not satisfied?`,
      a: `${company} works closely with clients throughout every engagement. If something isn't tracking as expected, we surface it early and adjust — we don't wait for a milestone to flag a problem. Our goal is long-term partnership, not a single transaction.`,
    },
    {
      q: `Do you work with businesses in multiple locations?`,
      a: `Yes. ${company} works with ${aud} across multiple locations, including businesses managing multi-country operations or teams spread across Southeast Asia. We'll discuss your specific geographic context in the discovery call.`,
    },
    {
      q: `How do you measure success?`,
      a: `We agree on specific, measurable KPIs at the start of every engagement — typically covering time saved, error rate reduction, and operational consistency. We report on these regularly throughout the engagement so you always have a clear picture of progress.`,
    },
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

  let title = `${kw} | ${company}`
  if (title.length > 60) title = `${kw} — ${company}`.slice(0, 57) + '...'

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
      anchorText:   `${svc} services`,
      suggestedURL: `/services/${slugify(svc)}`,
      relevance:    'High',
    })
    suggestions.push({
      anchorText:   `How ${svc} works`,
      suggestedURL: `/blog/how-${slugify(svc)}-works`,
      relevance:    'Medium',
    })
  })

  suggestions.push({ anchorText: 'Contact us',  suggestedURL: '/contact', relevance: 'High' })
  suggestions.push({ anchorText: 'About us',     suggestedURL: '/about',   relevance: 'Low'  })

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
  const { keyword, intent, funnel, pageType } = keywordObj
  const { companyName = '', services = '', targetAudience = '', country = '' } = project

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
    id:             generateId(),
    keywordId:      keywordObj.id,
    targetKeyword:  keyword,
    focusKeyphrase: keyword,
    lsiKeywords:    lsi,
    intent,
    funnel,
    pageType,
    audience:       targetAudience,
    suggestedH1,
    h2s,
    faqs,
    cta,
    internalLinks:  links,
    meta,
    slug:           slugify(keyword),
    wordCountTarget:    funnel === 'TOFU' ? '1,200–1,800 words' : funnel === 'MOFU' ? '1,000–1,500 words' : '800–1,200 words',
    readabilityTarget:  'Grade 8–10 reading level. Short paragraphs (3–4 sentences max). Use bullet lists for 3+ items.',
    brandBrainApplied:  false,
    createdAt:      new Date().toISOString(),
  }
}

// ─── Util ─────────────────────────────────────────────────────────────────────

function titleCase(str) {
  return (str || '').replace(/\w\S*/g, txt =>
    txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  )
}
