// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT FIXER
// Deterministic, rule-based fix functions. Each takes (content, brief, project)
// and returns an updated content object (or the same object if nothing changed).
// No API calls — all content is generated from templates + context fields.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Helpers ───────────────────────────────────────────────────────────────────

function countWords(text) {
  return (text || '').split(/\s+/).filter(Boolean).length
}

function firstOf(csv) {
  return (csv || '').split(',')[0]?.trim() || ''
}

function hasFAQSection(body) {
  return /##\s+.*(faq|frequently asked|question)/i.test(body)
}

function hasCTASection(body) {
  return /\b(book a|schedule a|contact us|get in touch|get a quote|free consultation|reach out|speak to our|get started today|request a)\b/i.test(body)
}

function hasProcessSection(body) {
  return /##\s+.*(how.*(it.)?work|step.by.step|our process|what (to )?expect|how we work)/i.test(body)
}

function hasDecisionSection(body) {
  return /##\s+.*(what to look for|how to choose|evaluat|key factor|criteria|things to consider)/i.test(body)
}

function hasRelatedReadingSection(body) {
  return /##\s+.*(related reading|related resource|further reading|useful resource|more resource)/i.test(body)
}

// Insert section before the last CTA/conclusion heading, or append
function insertBeforeConclusion(body, section) {
  const re = /\n(## .{0,60}(ready|get started|next step|contact|conclusion|summary|take action|final thought).{0,30})\n/i
  const match = re.exec(body)
  if (match) {
    const idx = body.lastIndexOf(match[0])
    return body.slice(0, idx).trimEnd() + '\n\n' + section + body.slice(idx)
  }
  return body.trimEnd() + '\n\n' + section
}

// Insert section after the first H2 section ends (i.e. just before the second H2)
function insertAfterFirstSection(body, section) {
  const firstH2 = body.match(/\n## .+\n/)
  if (!firstH2) return insertBeforeConclusion(body, section)
  const startIdx = body.indexOf(firstH2[0]) + firstH2[0].length
  const secondH2 = body.indexOf('\n## ', startIdx)
  if (secondH2 === -1) return insertBeforeConclusion(body, section)
  return body.slice(0, secondH2).trimEnd() + '\n\n' + section + body.slice(secondH2)
}

// ── Fix 1: Add a stronger CTA section ────────────────────────────────────────

function fixAddCTA(content, brief, project) {
  const body = content.body || ''
  if (hasCTASection(body)) return content

  const keyword  = brief?.targetKeyword || content.targetKeyword || 'this service'
  const company  = project?.companyName || 'our team'
  const funnel   = brief?.funnel || 'TOFU'
  const audience = firstOf(project?.targetAudience || brief?.audience || 'businesses')
  const isBOFU   = funnel === 'BOFU'
  const isMOFU   = funnel === 'MOFU'

  let section
  if (isBOFU) {
    section = `## Ready to Get Started?\n\nIf you're evaluating options for ${keyword}, ${company} works with ${audience} who want a practical, low-risk path forward — not a drawn-out process.\n\nThe most efficient next step is a short discovery call. You'll get a clear picture of what's realistic, what the process looks like, and whether we're a good fit — no obligation, no hard sell.\n\n**[Book a Free 30-Minute Discovery Call →](#contact)**\n\nPrefer to ask a question first? [Get in touch here](#contact) and we'll respond within one business day.`
  } else if (isMOFU) {
    section = `## Not Sure Which Option Is Right for You?\n\nChoosing the right approach to ${keyword} depends on your team, your existing systems, and what you're specifically trying to fix — not a generic checklist.\n\nIf you'd like to talk through your options before committing, ${company} offers a free 30-minute consultation for ${audience}. It's a conversation, not a sales pitch.\n\n**[Schedule a Free Consultation →](#contact)**\n\nOr [send us a question directly](#contact) — we're happy to point you in the right direction even if we're not the right fit for you.`
  } else {
    section = `## Want a Second Opinion on Your Current Approach?\n\nIf any part of this guide raised questions about your current setup, ${company} is easy to reach. We work with ${audience} on ${keyword} and are happy to give an honest second opinion — no obligation.\n\n**[Get in Touch →](#contact)**\n\nOr [explore more of our resources](#) for related guides and case studies.`
  }

  const newBody = body.trimEnd() + '\n\n' + section
  return { ...content, body: newBody, wordCount: countWords(newBody) }
}

// ── Fix 2: Add FAQ section ────────────────────────────────────────────────────

function fixAddFAQ(content, brief, project) {
  const body = content.body || ''
  if (hasFAQSection(body)) return content

  const keyword  = brief?.targetKeyword || content.targetKeyword || 'this service'
  const kw       = keyword.toLowerCase()
  const audience = firstOf(project?.targetAudience || brief?.audience || 'businesses')

  let faqPairs
  if (brief?.faqs?.length >= 3) {
    faqPairs = brief.faqs.slice(0, 5).map(f => `**${f.q}**\n\n${f.a}`)
  } else {
    faqPairs = [
      `**What is ${kw} and is it relevant to my business?**\n\n${kw.charAt(0).toUpperCase() + kw.slice(1)} covers the processes and decisions involved in managing ${kw} effectively. For ${audience}, relevance depends on your current size, how manual your existing approach is, and where the friction sits in your day-to-day workflow. A short scoping conversation is usually the fastest way to find out.`,
      `**How long does it typically take to implement?**\n\nTimelines vary by scope and starting point. Most ${audience} start to see early improvements within 4–8 weeks; more significant outcomes take 3–6 months. The biggest variable is internal coordination — implementations with a dedicated internal owner typically move meaningfully faster.`,
      `**What does it typically cost?**\n\nCost depends on the scope of what you need and the provider you choose. It's worth getting two or three quotes and comparing what's genuinely included — the lowest headline price often excludes onboarding, training, or ongoing support. Some ${audience} may also qualify for government grants that partially offset the investment.`,
      `**What should we look for when evaluating providers?**\n\nLook for relevant experience with businesses similar to yours, transparent pricing, a clearly documented process, and references you can actually speak to. Be cautious of providers who can't explain their methodology clearly or make guarantees they can't substantiate.`,
      `**What are the most common mistakes to avoid?**\n\nThe most common mistakes are starting without clear success criteria, underestimating the change management involved, and selecting based on price alone. Defining what success looks like before you start — and assigning clear ownership internally — prevents most of the issues that derail these projects.`,
    ]
  }

  const section = `## Frequently Asked Questions\n\n${faqPairs.join('\n\n---\n\n')}`
  const newBody = insertBeforeConclusion(body, section)
  return { ...content, body: newBody, wordCount: countWords(newBody) }
}

// ── Fix 3: Add internal link paragraph ───────────────────────────────────────

function fixAddInternalLinks(content, brief, project) {
  const body    = content.body || ''
  if (hasRelatedReadingSection(body)) return content

  const keyword   = brief?.targetKeyword || content.targetKeyword || 'this topic'
  const kw        = keyword.toLowerCase()
  const briefLinks = brief?.internalLinks || []

  let linkItems
  if (briefLinks.length >= 2) {
    linkItems = briefLinks.slice(0, 4).map(l => {
      const text = l.anchorText || l.anchor || l.text || l.title || kw
      const url  = l.suggestedURL || l.url || '#'
      return `- [${text}](${url})`
    })
  } else {
    linkItems = [
      `- [Our complete guide to ${kw}](#) — everything from getting started to advanced strategy`,
      `- [How to choose the right ${kw} provider](#) — an honest comparison of the approaches available`,
      `- [Frequently asked questions about ${kw}](#faq) — answers to the questions we hear most often`,
      `- [Talk to our team](#contact) — for a personalised recommendation based on your situation`,
    ]
  }

  const section = `## Related Reading\n\nIf you'd like to go deeper on any of the topics covered in this guide, the following resources may be useful:\n\n${linkItems.join('\n')}\n\nIf none of these cover what you're looking for, [reach out to our team directly](#contact) — we're happy to point you in the right direction.`
  const newBody = insertBeforeConclusion(body, section)
  return { ...content, body: newBody, wordCount: countWords(newBody) }
}

// ── Fix 4: Add Singapore / local context paragraph ───────────────────────────

const SG_CONTEXT = {
  hr:      `Singapore employers must comply with Ministry of Manpower (MOM) regulations, CPF contribution rules, and Employment Act provisions. For businesses on Work Pass quotas, monthly foreign worker levy calculations add a further layer of complexity. The Fair Consideration Framework (FCF) also requires that all job vacancies be advertised on MyCareersFuture for at least 14 days before a foreign candidate can be considered. Getting these processes right isn't optional — non-compliance carries financial penalties and potential reputational damage, particularly for companies seeking government contracts or Work Pass renewals.\n\nSingapore businesses investing in HR systems or consulting may also be eligible for the Productivity Solutions Grant (PSG) or Enterprise Development Grant (EDG), which can offset a significant portion of qualifying costs.`,
  finance: `Singapore businesses operating under IRAS regulations must file accurate tax returns, maintain ACRA-compliant records, and — where annual turnover exceeds S$1 million — register for and file GST. The transition to mandatory XBRL financial reporting for many companies has added a further compliance layer. MAS regulations under the Payment Services Act also apply to businesses handling digital payments or customer funds.\n\nFor SMEs looking to modernise their financial operations, the IMDA SMEs Go Digital programme and Enterprise Singapore's PSG pre-approved vendor list simplify both the solution selection and grant application process.`,
  tech:    `Technology businesses in Singapore operate under the Personal Data Protection Act (PDPA), which mandates clear data governance policies, defined breach notification obligations, and organisational accountability for data protection. For companies in regulated sectors, MAS Technology Risk Management (TRM) guidelines set specific standards for system resilience and cybersecurity controls.\n\nIMDA's SMEs Go Digital programme, the Digital Resilience Bonus, and Enterprise Singapore's Scale-Up SG initiative all provide meaningful support for businesses investing in digital capabilities. If you haven't recently reviewed your grant eligibility, it's worth doing before finalising your budget.`,
  default: `Singapore businesses investing in this area may be eligible for government support through the Productivity Solutions Grant (PSG) or the Enterprise Development Grant (EDG) — both administered through Enterprise Singapore. The PSG covers up to 50% of qualifying costs for pre-approved solutions, while the EDG supports broader capability-building and business transformation initiatives.\n\nSkillsFuture Enterprise Credit can also be used to offset the cost of workforce training and reskilling directly connected to new systems or processes. Singapore's grant landscape is genuinely useful — but it's underutilised, largely because businesses aren't aware of what applies to their situation.`,
}

function fixAddLocalContext(content, brief, project) {
  const body    = content.body || ''
  const country = project?.country || ''
  const isSG    = /singapore/i.test(country)

  if (!country) return content

  // For SG: skip if already has enough SG references
  if (isSG) {
    const sgMentions = (body.match(/\b(singapore|sgd|mom|cpf|iras|psg|edg|pdpa|imda)\b/gi) || []).length
    if (sgMentions >= 6) return content
  } else {
    // Non-SG: skip if country mentioned 3+ times already
    const mentions = (body.match(new RegExp(`\\b${country}\\b`, 'gi')) || []).length
    if (mentions >= 3) return content
  }

  const keyword  = brief?.targetKeyword || content.targetKeyword || 'this service'
  const services = (project?.services || '').toLowerCase()
  const industry = (project?.industry  || '').toLowerCase()
  const combined = services + ' ' + industry

  let section
  if (isSG) {
    const isHR      = /hr|human resource|payroll|recruitment|hiring|talent|employee|workforce/.test(combined)
    const isFinance = /finance|accounting|fintech|payment|invoice|tax|gst|audit|bookkeeping/.test(combined)
    const isTech    = /saas|software|tech|digital|cloud|platform|app|system|data|automation/.test(combined)

    const bodyText = isHR ? SG_CONTEXT.hr : isFinance ? SG_CONTEXT.finance : isTech ? SG_CONTEXT.tech : SG_CONTEXT.default
    section = `## What Singapore Businesses Need to Know\n\n${bodyText}`
  } else {
    section = `## What ${country} Businesses Need to Know\n\nFor businesses operating in ${country}, the approach to ${keyword} is shaped by local market conditions, regulatory requirements, and buyer expectations that generic global guides often don't account for.\n\nThe practical differences — in how decisions are made, what compliance obligations apply, and what local providers can realistically deliver — matter more than most business owners expect. If you're navigating ${keyword} as a ${country}-based business and want guidance grounded in your specific context, working with a local specialist is usually the most direct route to a useful answer.`
  }

  const newBody = insertAfterFirstSection(body, section)
  return { ...content, body: newBody, wordCount: countWords(newBody) }
}

// ── Fix 5: Split overly long paragraphs ──────────────────────────────────────

function fixLongParagraphs(content, brief, project) {
  const body   = content.body || ''
  const blocks = body.split('\n\n')
  let changed  = false

  const fixed = blocks.flatMap(block => {
    if (block.trim().startsWith('#') || countWords(block) <= 90) return [block]

    // Match sentences (greedy up to punctuation)
    const sentences = block.match(/[^.!?]*[.!?]+(?:\s+|$)/g)
    if (!sentences || sentences.length < 3) return [block]

    // Split near the midpoint by word count
    const total = countWords(block)
    let acc      = 0
    let splitIdx = Math.ceil(sentences.length / 2)

    for (let i = 0; i < sentences.length; i++) {
      acc += countWords(sentences[i])
      if (acc >= total / 2) {
        splitIdx = i + 1
        break
      }
    }

    if (splitIdx <= 0 || splitIdx >= sentences.length) return [block]

    const p1 = sentences.slice(0, splitIdx).join('').trim()
    const p2 = sentences.slice(splitIdx).join('').trim()
    if (!p1 || !p2) return [block]

    changed = true
    return [p1, p2]
  })

  if (!changed) return content
  const newBody = fixed.join('\n\n')
  return { ...content, body: newBody, wordCount: countWords(newBody) }
}

// ── Fix 6: Add decision factors / evaluation criteria section ─────────────────

function fixAddDecisionFactors(content, brief, project) {
  const body = content.body || ''
  if (hasDecisionSection(body)) return content

  const keyword  = brief?.targetKeyword || content.targetKeyword || 'this service'
  const kw       = keyword.toLowerCase()
  const kwTitle  = keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase()
  const audience = firstOf(project?.targetAudience || brief?.audience || 'businesses')

  const section = `## What to Look for When Evaluating ${kwTitle} Options\n\nNot all ${kw} providers or approaches deliver the same results. Before committing, it's worth assessing against criteria that actually matter — not just price or a polished website.\n\n**1. Relevant experience with businesses like yours**\nLook for providers who have worked with ${audience} at a similar scale and in a comparable context. Ask for case studies or references from businesses you can speak with directly — not just logos on a website.\n\n**2. A clearly documented process**\nA credible provider should be able to explain exactly what happens from engagement to delivery: what you'll need to provide, what they'll deliver, realistic timelines, and what happens if something goes wrong. Vague answers at this stage tend to produce vague outcomes.\n\n**3. Transparent pricing with no hidden extras**\nGet a written quote that covers implementation, onboarding, training, and ongoing support. What appears to be a low headline price frequently grows once you factor in the components that aren't included in the base offer.\n\n**4. Agreed, measurable success criteria**\nBefore starting, align on what a successful outcome actually looks like — specific and measurable, not just activity-based. If a provider can't define what success means for your situation, that's worth probing before you sign anything.\n\n**5. Honest timelines and realistic expectations**\nBe cautious of providers promising unusually fast results. Ask what the most common reasons for delays are, and how they handle scope changes or unexpected complications — providers who have genuinely delivered before will have clear, confident answers.`

  const newBody = insertBeforeConclusion(body, section)
  return { ...content, body: newBody, wordCount: countWords(newBody) }
}

// ── Fix 7: Add how-it-works / process section ─────────────────────────────────

function fixAddProcess(content, brief, project) {
  const body = content.body || ''
  if (hasProcessSection(body)) return content

  const keyword  = brief?.targetKeyword || content.targetKeyword || 'this service'
  const kw       = keyword.toLowerCase()
  const company  = project?.companyName || 'a good provider'
  const audience = firstOf(project?.targetAudience || brief?.audience || 'businesses')

  const section = `## How the Process Works\n\nFor ${audience} who haven't been through a ${kw} engagement before, it helps to understand what to expect — step by step — before committing to anything.\n\n**Step 1: Discovery and scoping (Week 1–2)**\nBefore any work begins, the provider should spend time understanding your current situation: what's in place, what's creating friction, and what you're specifically trying to achieve. This typically involves a 1–2 hour scoping conversation and a review of any relevant documents, data, or existing processes.\n\n**Step 2: Proposal and alignment (Week 2–3)**\nBased on discovery, you'll receive a written proposal covering the recommended approach, specific deliverables, realistic timeline, and costs. This is the right point to ask questions, push back on anything unclear, and make sure both parties have aligned expectations before work starts.\n\n**Step 3: Implementation (Weeks 3–8)**\nThis is where the core work is done. Depending on scope, this may involve configuring systems, restructuring processes, training your team, or delivering specific outputs. A good provider keeps you informed throughout — not just when problems arise.\n\n**Step 4: Review and handover (Weeks 8–10)**\nOnce the initial scope is complete, there should be a structured review against the agreed success criteria. A solid handover includes documentation, training materials, and a clear point of contact for questions that come up afterward.\n\n**Step 5: Ongoing support or optimisation**\nMany ${kw} engagements have an ongoing component — regular check-ins, system updates, or periodic reporting. Clarify before you start what's covered in the initial scope and what falls under a separate support arrangement, so there are no surprises later.`

  const newBody = insertBeforeConclusion(body, section)
  return { ...content, body: newBody, wordCount: countWords(newBody) }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIX TYPE DETECTION
// Maps a structured issue object to a fix key (or null = not auto-fixable)
// ═══════════════════════════════════════════════════════════════════════════════

export function getFixType(fix) {
  const cat = fix.cat || fix.category || ''
  const msg = (fix.msg || '').toLowerCase()

  if (cat === 'Helpful') {
    if (/faq|frequently asked/.test(msg))             return 'faq'
    if (/process|how it works|no process/.test(msg))  return 'process'
    if (/decision|evaluat|what to look|criteria|doesn.t help reader/.test(msg)) return 'decisions'
    return null
  }

  if (cat === 'Conversion') {
    if (/no clear call.to.action|cta.*missing|missing.*cta|what.*should.*do.*next|doesn.t clearly state|signposted once|no clear reference/.test(msg)) return 'cta'
    if (/call.to.action|cta/.test(msg)) return 'cta'
    return null
  }

  if (cat === 'Links') {
    if (/anchor text|generic anchor/.test(msg)) return null  // manual edit required
    return 'links'
  }

  if (cat === 'Local') return 'local'

  if (cat === 'Readability') {
    if (/paragraph|text wall/.test(msg)) return 'paragraphs'
    return null // sentence length, heading count → manual edit
  }

  return null // SEO technical fixes (meta title, slug, density) → manual
}

// Human-readable labels for each fix type
export const FIX_LABELS = {
  faq:        'Add FAQ Section',
  process:    'Add How-It-Works Section',
  decisions:  'Add Evaluation Criteria',
  cta:        'Add CTA Section',
  links:      'Add Related Reading',
  local:      'Add Local Context',
  paragraphs: 'Split Long Paragraphs',
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DISPATCHER
// ═══════════════════════════════════════════════════════════════════════════════

export function applyFix(fixType, content, brief, project) {
  const FIXERS = {
    cta:       fixAddCTA,
    faq:       fixAddFAQ,
    links:     fixAddInternalLinks,
    local:     fixAddLocalContext,
    paragraphs: fixLongParagraphs,
    decisions: fixAddDecisionFactors,
    process:   fixAddProcess,
  }
  const fn = FIXERS[fixType]
  if (!fn) return content
  return fn(content, brief, project)
}
