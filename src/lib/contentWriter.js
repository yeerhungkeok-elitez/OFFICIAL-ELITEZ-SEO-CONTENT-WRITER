import { generateId } from './storage'

// ─── Utilities ────────────────────────────────────────────────────────────────

function tc(str) {
  return (str || '').replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
}

function firstOf(csv) {
  return (csv || '').split(',')[0]?.trim() || ''
}

function listOf(csv, max = 3) {
  return (csv || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, max)
}

function stripMarkup(h2) {
  return h2.replace(/[^a-zA-Z\s]/g, '').trim()
}

// Vary transitions so repeated sections don't sound templated
function pick(arr) {
  return arr[Math.floor(arr.length * 0.37)] // deterministic so rerenders are stable
}

// ─── Context Builder ──────────────────────────────────────────────────────────
// One object passed everywhere — avoids re-deriving the same values in every fn

function buildCtx(brief, project) {
  const { targetKeyword, funnel, pageType, audience } = brief
  const { companyName, services, country, industry, targetAudience, tone } = project

  const svc      = firstOf(services)
  const svcs     = listOf(services, 3)
  const aud      = firstOf(audience) || firstOf(targetAudience) || 'businesses'
  const allAuds  = listOf(targetAudience, 3)
  const co       = companyName || 'our team'
  const ind      = (industry || '').toLowerCase()
  const svcLower = (services || '').toLowerCase()

  const isSG      = /singapore/i.test(country || '')
  const isLocal   = isSG || (country && !/global|remote/i.test(country))
  const loc       = isLocal ? country : ''
  const locPhrase = loc ? ` in ${loc}` : ''

  // Detect B2B intent from audience text
  const isB2B = /\b(b2b|enterprise|manager|director|cto|cfo|ceo|hr|operations|procurement|startup|sme|company|companies|businesses|team|founder|exec)\b/i.test(targetAudience || '')

  // Page type flags
  const isServicePage = /service|landing/i.test(pageType)
  const isBlog        = /blog|guide|article/i.test(pageType)
  const isComparison  = /comparison/i.test(pageType)
  const isFAQPage     = /faq/i.test(pageType)

  // Funnel flags
  const isBOFU = funnel === 'BOFU'
  const isMOFU = funnel === 'MOFU'
  const isTOFU = funnel === 'TOFU'

  return {
    targetKeyword, funnel, pageType, svc, svcs, aud, allAuds, co,
    isSG, isLocal, loc, locPhrase,
    isB2B, isServicePage, isBlog, isComparison, isFAQPage,
    isBOFU, isMOFU, isTOFU,
    country, industry: ind, tone, services, svcLower, companyName,
  }
}

// ─── Singapore / Local Market Context ─────────────────────────────────────────
// Returns a specific, factual sentence or paragraph for the local market.
// Keeps it grounded — no invented stats, no puffery.

function getLocalHook(ctx, type = 'general') {
  const { isSG, svcLower, industry, loc } = ctx

  if (isSG) {
    // HR, payroll, employment, recruitment
    if (/hr|human resource|payroll|recruitment|hiring|talent|employee|workforce|leave|attendance/.test(svcLower + industry)) {
      const hooks = {
        regulatory: `In Singapore, employers must navigate MOM regulations, CPF contribution rules, Fair Consideration Framework (FCF) requirements, and — for companies on Work Pass quotas — monthly foreign worker levy calculations. Even well-run businesses make costly errors when these processes aren't properly systemised.`,
        market:     `Singapore's labour market is one of the tightest in the region. With local employment at near-full levels, the cost of losing a good employee — or failing to attract the right one — is significantly higher than it was five years ago. HR processes that create friction at any stage of the employee lifecycle are no longer a minor inconvenience; they're a business risk.`,
        grants:     `Singapore businesses can tap the Productivity Solutions Grant (PSG) and Enterprise Development Grant (EDG) to subsidise qualifying HR software and consulting investments. Depending on scope, SMEs may recover 50–80% of eligible costs. If you haven't reviewed your grant eligibility recently, it's worth doing before committing to any investment.`,
        general:    `For Singapore businesses, getting HR right is both an operational and a compliance challenge. MOM regulations, CPF requirements, and Employment Act provisions create a framework where mistakes — even unintentional ones — have real consequences. Building the right infrastructure early makes everything easier to manage as your headcount grows.`,
      }
      return hooks[type] || hooks.general
    }

    // Finance, accounting, tax, GST
    if (/finance|accounting|fintech|payment|invoice|tax|gst|audit|bookkeeping|cash flow|budget/.test(svcLower + industry)) {
      const hooks = {
        regulatory: `Singapore businesses must meet IRAS GST filing requirements, ACRA annual return deadlines, and — for registered entities — XBRL financial reporting standards. The consequences of non-compliance range from financial penalties to reputational damage, particularly for businesses seeking external investment or government contracts.`,
        market:     `Singapore's position as a regional financial centre means the bar for financial governance is high. Investors, banks, and enterprise clients increasingly scrutinise how well a business manages its finances operationally — not just at year-end.`,
        grants:     `SMEs in Singapore can access support through Enterprise Singapore and the IMDA SMEs Go Digital programme to modernise financial management systems. Some solutions qualify under the PSG pre-approved vendor list, which simplifies the grant application process significantly.`,
        general:    `For Singapore businesses, financial management sits at the intersection of operational efficiency and regulatory compliance. Between GST reporting, XBRL filing, and IRAS requirements, the administrative burden on growing companies is real — and the risk of getting it wrong grows with the business.`,
      }
      return hooks[type] || hooks.general
    }

    // SaaS, software, tech, digital, cloud
    if (/saas|software|tech|digital|cloud|platform|app|system|data|api|automation/.test(svcLower + industry)) {
      const hooks = {
        regulatory: `Singapore-based technology companies operating in regulated sectors must align with MAS Technology Risk Management (TRM) guidelines and the Personal Data Protection Act (PDPA). For those handling cross-border data, the PDPC's advisory guidelines on overseas transfers add another layer of consideration. Building compliance into your architecture from the start is meaningfully cheaper than retrofitting it later.`,
        market:     `Singapore's role as Southeast Asia's technology hub creates genuine opportunity — but also intense competition. The businesses that grow beyond the local market are typically those that have built operationally sound foundations: reliable infrastructure, clean processes, and strong customer success practices that don't require reinvention at every growth stage.`,
        grants:     `The IMDA SMEs Go Digital programme, Digital Resilience Bonus, and Enterprise Singapore's Scale-Up SG initiative all offer relevant support for technology companies at different stages. If you're investing in capability-building — new infrastructure, team development, or market expansion — it's worth mapping your activities against available grants before finalising your budget.`,
        general:    `Singapore's technology sector is maturing fast. Local and regional competition is sharper than it was three years ago, and the expectations of enterprise buyers — in Singapore and across the region — have risen accordingly. The businesses gaining ground are the ones that treat operational excellence as a competitive advantage, not an afterthought.`,
      }
      return hooks[type] || hooks.general
    }

    // Legal, professional services, consulting
    if (/legal|law|consulting|advisory|professional service|strategy|management/.test(svcLower + industry)) {
      const hooks = {
        regulatory: `Singapore professional services firms operate in a highly regulated environment. Whether you're dealing with Law Society requirements, public accountancy regulations, or sector-specific licensing, staying current on obligations — and demonstrating that to clients — is a baseline expectation.`,
        market:     `Singapore's professional services market is sophisticated. Clients — particularly corporate and institutional ones — evaluate providers not just on technical competence but on operational reliability, data handling practices, and the quality of their client communication. Operational credibility is increasingly part of the brief.`,
        general:    `For professional services firms in Singapore, the competitive landscape has changed. Price competition from regional providers and the increasing capability of technology-enabled alternatives means that operational excellence — how reliably and efficiently you deliver — is now a key differentiator.`,
      }
      return hooks[type] || hooks.general
    }

    // Real estate, property
    if (/real estate|property|landlord|tenant|rental|leasing|mortgage|conveyancing/.test(svcLower + industry)) {
      const hooks = {
        regulatory: `Singapore's property market operates under URA guidelines, HDB regulations, and ABSD frameworks that change with some regularity. Staying current on regulatory shifts — and communicating those changes clearly to clients — is part of what separates credible operators from the rest.`,
        general:    `Singapore's property market is one of the region's most active and closely regulated. For businesses operating in this space, navigating ABSD policies, stamp duties, and URA planning requirements while delivering quality client service requires both expertise and operational discipline.`,
      }
      return hooks[type] || hooks.general
    }

    // Logistics, supply chain, trade
    if (/logistic|supply chain|freight|shipping|warehouse|trade|import|export|customs/.test(svcLower + industry)) {
      const hooks = {
        regulatory: `Singapore's position as a global trade hub comes with a sophisticated customs and regulatory framework administered by Singapore Customs and the Port of Singapore Authority. Businesses handling cross-border trade need processes that are both efficient and audit-ready — customs penalties and shipment delays are costly in a market where speed is a competitive factor.`,
        general:    `As one of the world's busiest ports, Singapore is at the centre of regional and global supply chains. Businesses operating in this space face constant pressure on margins, turnaround times, and reliability — and the operational systems supporting the business need to match that pace.`,
      }
      return hooks[type] || hooks.general
    }

    // General Singapore SME fallback
    const general = {
      regulatory: `Singapore's regulatory environment is among the most rigorous in Asia. Whether you're navigating employment law, data protection requirements, financial reporting obligations, or sector-specific licensing, the details matter — and the cost of getting them wrong tends to surface at the worst possible time.`,
      market:     `Singapore SMEs operate in a high-cost, high-expectation market. The businesses that compete successfully tend to be operationally sharp — they've systemised the repeatable parts of their operation so their best people can focus on work that genuinely requires them.`,
      grants:     `Singapore's grant landscape for SMEs is genuinely useful — but underutilised. The PSG, EDG, SkillsFuture Enterprise Credit, and various MCI and EnterpriseSG programmes cover a wide range of capability-building activities. The challenge is knowing what's available and structuring your investment to qualify.`,
      general:    `Singapore is a high-cost, high-efficiency market. Businesses that thrive here tend to be lean and operationally deliberate — they've solved the right problems with the right resources, rather than growing headcount to compensate for process gaps.`,
    }
    return general[type] || general.general
  }

  // Non-Singapore local market
  if (loc) {
    return `For businesses in ${loc}, the specific context around ${firstOf(ctx.services)} includes local market dynamics, regulatory requirements, and competitive factors that a generic approach often fails to address. Understanding this context is part of how ${ctx.co} delivers results that are actually relevant to your situation.`
  }

  return ''
}

// ─── Introduction Variants ────────────────────────────────────────────────────
// Varies by funnel stage and page type — avoids generic "In today's world..."

function writeIntro(brief, project, ctx) {
  const { targetKeyword, cta } = brief
  const { svc, aud, co, locPhrase, loc, isSG, isB2B, isBOFU, isMOFU, isTOFU,
          isServicePage, isBlog, isComparison, industry, services, country } = ctx

  // ── BOFU: Service Page ──────────────────────────────────────────────────────
  if (isBOFU && isServicePage) {
    const sgLine = isSG
      ? `\n\n${getLocalHook(ctx, 'general')}`
      : ''
    return `Most ${aud} who land on this page have already done their research. You understand what **${targetKeyword}** involves, you've probably compared a few options, and now you're deciding whether ${co} is the right fit for your business.

That's a fair question — and this page answers it directly.

Below you'll find exactly what our ${svc} service covers, how the process works from day one, who it's best suited for, and what results our clients typically see.${sgLine} If something here doesn't answer your question, we're easy to reach.`
  }

  // ── BOFU: Not service page ──────────────────────────────────────────────────
  if (isBOFU) {
    return `You've probably been thinking about **${targetKeyword}** for a while. You've had internal conversations, looked at a few options, and now you're getting close to a decision.

This page has one goal: give you a clear, complete picture of what working with ${co} actually looks like — so you can make a confident call without needing three more calls to get there.

We'll cover scope, process, timelines, expectations, and the questions most ${aud} ask before they start. No pressure, no pitch — just the information you need.`
  }

  // ── MOFU: Comparison page ──────────────────────────────────────────────────
  if (isMOFU && isComparison) {
    return `If you're researching **${targetKeyword}** options, be cautious of comparison articles that don't acknowledge trade-offs. Most "best of" lists are written to rank — not to actually help you decide.

The honest answer is: the right solution depends on your specific situation. Your team size, budget, internal capabilities, and growth stage all change the equation significantly. What works well for a 200-person company may be the wrong choice for a 25-person team — even in the same industry.

This guide is designed to help you build the right evaluation framework for your context. By the end, you'll have a clear set of criteria to apply — and a list of questions worth asking any provider you're considering.`
  }

  // ── MOFU: General consideration ───────────────────────────────────────────
  if (isMOFU) {
    const b2bLine = isB2B
      ? `\n\nIf you're evaluating this on behalf of your organisation, we've also included a section on how to build the internal case — because getting buy-in from the right stakeholders is often half the challenge.`
      : `\n\nBy the end of this guide, you'll have a clear framework for evaluating your options and a short set of questions worth asking before committing.`
    return `Choosing the right approach to **${targetKeyword}** is harder than it should be. There's too much vendor noise, too many "solutions" that solve the wrong problem, and not enough honest guidance on what actually works for businesses like yours.

This guide cuts through that. We're going to walk you through the factors that genuinely matter — and the ones that sound important but rarely are — so you can make a decision you won't regret six months from now.${b2bLine}`
  }

  // ── TOFU: Blog / guide ─────────────────────────────────────────────────────
  if (isTOFU && isBlog) {
    const openings = [
      `Most ${aud} don't set out to get **${targetKeyword}** wrong. They start with a reasonable approach — a spreadsheet here, a manual process there — and it works until it doesn't.`,
      `Here's an honest question worth sitting with: is the way you're currently handling **${targetKeyword}** actually working, or has it just become too familiar to question?`,
      `There's a version of **${targetKeyword}** that genuinely moves the needle for ${aud} — and a version that keeps the team busy without improving much. The difference usually comes down to a few fundamental decisions made early.`,
    ]
    const opening = openings[0] // stable, not random
    const sgLine  = isSG
      ? `\n\nFor businesses${locPhrase}, there's also a compliance dimension to consider — one that catches even experienced operators off-guard. We'll cover that too.`
      : ''
    return `${opening}

This guide explains what **${targetKeyword}** actually involves, why it matters for ${aud}, and what a practical, no-fluff approach looks like in practice. You'll find a breakdown of common mistakes and a clear path to getting it right — whether you're starting from scratch or improving something that already exists.${sgLine}

If you're early in your research, start at the beginning. If you've already got a foundation and want to pressure-test it, skip to the section that's most relevant to your situation.`
  }

  // ── TOFU: Default ──────────────────────────────────────────────────────────
  const sgLine = isSG ? `\n\n${getLocalHook(ctx, 'general')}` : ''
  return `If you've been looking for a practical, no-nonsense breakdown of **${targetKeyword}**, this is it.

Not a generic overview — a guide written specifically for ${aud}${locPhrase} who need to understand what ${svc} actually involves, how to approach it strategically, and what separates businesses that get this right from those that don't.${sgLine}

By the end of this article, you'll have a grounded understanding of ${targetKeyword} and a clear sense of the next step to take.`
}

// ─── Section Body Writers ──────────────────────────────────────────────────────

function writeBenefits(h2, brief, project, ctx) {
  const { targetKeyword } = brief
  const { svc, aud, co, loc, locPhrase, isSG, isB2B, isBOFU, isMOFU,
          country, industry, services } = ctx
  const sgLine = isSG ? `\n\n${getLocalHook(ctx, 'market')}` : ''

  if (isB2B && isBOFU) {
    return `For ${aud}, the business case for **${targetKeyword}** tends to come down to three things: time, risk, and scale.

**Time recovered at the operational level**
When ${svc} is handled properly, your team stops firefighting and starts executing. Hours previously spent on manual workarounds, data reconciliation, and chasing approvals come back. Most of our clients recover meaningful team time in the first quarter — time that gets redirected to higher-value work.

**Risk reduced at the management level**
Ad-hoc ${svc} creates exposure: compliance gaps, data errors, key-person dependencies. A structured approach surfaces these vulnerabilities before they become problems your board notices — or your auditor flags.

**A foundation that scales without being rebuilt**
The processes that work for a 20-person team typically break somewhere between 50 and 80 people — often under the pressure of growth, when you can least afford disruption. Getting the ${svc} infrastructure right now means you won't need to pause and rebuild it later.${sgLine}

If you're preparing an internal business case, these three areas — time, risk, and scale — tend to resonate most with finance and executive stakeholders. We can help you frame it if needed.`
  }

  if (isB2B) {
    return `The value of getting **${targetKeyword}** right isn't always visible on day one. It tends to compound.

Here's what ${aud} consistently report after building a proper ${svc} foundation:

- **Less time lost to administration** — When ${svc} is systemised, the coordination overhead shrinks. Teams spend less time managing the process and more time delivering outcomes.
- **Fewer decisions made on bad data** — Inconsistent ${svc} creates unreliable data. When the foundation is solid, the decisions built on top of it are more confident — and more accurate.
- **Smoother onboarding as the team grows** — A well-documented ${svc} system is far easier to onboard new hires into. What took weeks to explain informally can be picked up in days.
- **Reduced exposure to compliance and operational risk** — This is particularly relevant${locPhrase}. The businesses that have clean ${svc} processes tend to handle audits, due diligence, and regulatory reviews with significantly less friction.
- **A more scalable business overall** — The ceiling on growth is often operational. Get ${targetKeyword} right and you raise the ceiling.${sgLine}`
  }

  return `The benefits of getting **${targetKeyword}** right compound over time. Here's what that looks like in practice for ${aud}:

- **More time on what actually matters** — A well-built ${svc} process removes friction from day-to-day operations. The hours spent on workarounds, manual updates, and fixing errors redirect to higher-value work.
- **Fewer expensive mistakes** — Most errors in ${svc} aren't caused by carelessness — they come from unclear processes, missing handoffs, or inconsistent execution. A clear structure eliminates most of them.
- **Better decisions, faster** — When ${targetKeyword} is in order, you have reliable information when you need it. That changes how the whole business operates.
- **A foundation that doesn't need rebuilding at every growth stage** — Getting this right early is significantly cheaper than retrofitting it under the pressure of growth.

The businesses${locPhrase} that treat **${targetKeyword}** as a foundation — not a task — tend to look back and wonder why they waited.${sgLine}`
}

function writeHowItWorks(h2, brief, project, ctx) {
  const { targetKeyword } = brief
  const { svc, aud, co, loc, locPhrase, isSG, isB2B, isBOFU, country, industry, services } = ctx

  if (isBOFU) {
    const sgStep = isSG
      ? `\n\n*For Singapore-based clients: we include a regulatory alignment review at this stage — checking your ${svc} setup against current MOM, IRAS, and relevant statutory requirements. This is included at no additional cost.*`
      : ''

    return `Here's what working with ${co} on **${targetKeyword}** actually looks like — from first conversation to ongoing delivery. No surprises.

**Week 1–2: Discovery and baseline assessment**
We start where you are, not where we assume you are. That means an honest look at your current ${svc} setup: what's working, what's a workaround that became a habit, and what's genuinely missing. We map the quick wins alongside the structural improvements.

**Week 3–4: Strategy and roadmap**
You get a clear plan — what we're doing, in what order, and why. Every decision is explained, not just delivered. If we think something should be prioritised differently based on what we've found, we'll tell you — and explain the reasoning.${sgStep}

**Month 2 onwards: Phased execution**
We implement in phases. High-impact changes first, with results tracked as we go. You'll have regular updates — not just at milestone points — and a direct line to your account contact throughout.

**Ongoing: Review and optimisation**
${tc(svc)} isn't set-and-forget. Regular reviews keep your approach aligned with where the business is heading — especially as you grow, bring on new team members, or enter new markets.

Most ${aud} working with ${co} see measurable improvement within the first 60–90 days. We agree on what "measurable" means for your business before we start.`
  }

  return `Understanding how **${targetKeyword}** works in practice — not just in theory — is the difference between a plan that looks good and one that actually gets implemented.

**Step 1: Audit your current reality honestly**
Before changing anything, get a clear picture of where things actually stand. Not how you think they work — how they actually work. Talk to the people closest to the ${svc} process. The gap between "documented process" and "what we actually do" is usually where the biggest problems live.

**Step 2: Define success in specific terms**
"Improve ${svc}" is too vague to act on. A good target sounds more like: "Reduce the time required to complete [specific task] from X hours to Y hours by [date]." Specific, measurable, and bounded. Vague goals drift; specific ones get done.

**Step 3: Build infrastructure that fits how your team works**
This might mean better processes, better tools, clearer ownership, or a combination. The critical thing is that whatever you build is designed for how your team *actually* operates — not how you wish they operated.

**Step 4: Roll it out in phases**
Resist the urge to change everything at once. A phased approach manages disruption, creates space to learn, and generates early wins that build momentum.

**Step 5: Review regularly and adjust based on data**
Monthly checkpoints are a good cadence to start. Enough time to see results; short enough to catch problems before they compound.

${co} supports ${aud} at every stage of this process — whether that's one step or the whole journey.`
}

function writeMistakes(h2, brief, project, ctx) {
  const { targetKeyword } = brief
  const { svc, aud, co, loc, isSG, isB2B, country, industry, services } = ctx
  const sgLine = isSG ? `\n\n${getLocalHook(ctx, 'regulatory')}` : ''

  if (isB2B) {
    return `These are the mistakes ${aud} most commonly make with **${targetKeyword}**. Most are avoidable — but only if you know to look for them.

**Treating ${svc} as a project instead of a practice**
Businesses that implement ${targetKeyword} once and move on often find themselves back at square one 12–18 months later. ${tc(svc)} requires regular review and maintenance. Build that in from the start, not as an afterthought.

**Defining the solution before the problem**
It's surprisingly common to evaluate tools or providers before clearly articulating what you're actually trying to solve. The result is a solution that addresses the wrong problem — or a slightly improved version of the old problem, running on newer infrastructure.

**Underestimating the change management dimension**
Even the best ${svc} approach fails if the people responsible for it aren't genuinely on board. Involving the right stakeholders early — especially those closest to the day-to-day — dramatically improves adoption. Skip this step and you're building on sand.

**Measuring activity instead of outcomes**
Tracking how many tasks were completed tells you very little about whether the business is better off. Define the outcome metrics before you start — and review them regularly, not just at the end.

**Scaling on a weak foundation**
Growing a team or operation on an informal ${svc} setup is one of the most common sources of organisational pain in scaling businesses. What works for 15 people usually breaks at 40 — often at the moment of fastest growth, when you can least afford to stop and fix it.${sgLine}`
  }

  return `Even capable ${aud} make avoidable mistakes with **${targetKeyword}**. The patterns are consistent enough that spotting them early saves real time and money.

**Starting with the tool, not the problem**
The most common trap in ${targetKeyword} is reaching for a software solution before understanding what you're actually trying to fix. Better tools on broken processes just create faster versions of the same problem.

**Skipping documentation in the name of "moving fast"**
If your ${svc} approach only lives in someone's head, it's fragile. One team change or absence shouldn't break your operation. Even a rough process document is better than nothing.

**Treating it as a one-time setup**
${tc(svc)} needs regular attention. The businesses that get the most from ${targetKeyword} treat it as an ongoing practice, not a project with an end date.

**Spreading effort too thin**
Trying to optimise everything at once means nothing gets done properly. Choose the one or two improvements that will have the highest impact and go deep — before expanding scope.

**Ignoring the people side**
Process and tooling account for maybe 40% of ${svc} outcomes. The other 60% is whether the people involved understand, believe in, and consistently follow through. Any change that doesn't account for this fails more often than it succeeds.${sgLine}`
}

function writeGettingStarted(h2, brief, project, ctx) {
  const { targetKeyword } = brief
  const { svc, aud, co, loc, isSG, isB2B, country, industry, services } = ctx
  const sgGrants = isSG
    ? `\n\n**Singapore businesses:** Before finalising your approach or budget, check your eligibility for the Productivity Solutions Grant (PSG) or Enterprise Development Grant (EDG). ${getLocalHook(ctx, 'grants')}`
    : ''

  if (isB2B) {
    return `If you're ready to move forward with **${targetKeyword}**, here's a sequence that consistently works for ${aud}:

**1. Get internal alignment before anything else**
Before evaluating solutions or engaging any external support, ensure the key stakeholders inside your organisation agree on the problem you're solving and what success looks like. Misaligned expectations at this stage create expensive course corrections — and often kill good initiatives for the wrong reasons.

**2. Do an honest baseline review**
Spend time with the people who handle ${svc} day-to-day, not just the managers who oversee it. The gap between "how we think this works" and "how it actually works" is where the real problems tend to live — and where the most impactful improvements hide.

**3. Scope the first phase conservatively**
It's tempting to tackle everything at once, especially if there's accumulated frustration with the current state. Resist that. A narrowly scoped first phase that delivers visible results in 60–90 days builds more momentum — internally and externally — than an ambitious overhaul that takes eight months to show anything.

**4. Build your evaluation criteria before talking to providers**
Decide what matters most to your business — functionality, implementation support, local market knowledge, price, or something else — before any vendor conversations. This protects you from being sold a solution that's designed for someone else's problem.

**5. Start with a pilot**
Where possible, test your approach in one part of the business before scaling it. You'll surface issues you didn't anticipate — and solve them while the stakes are still low.

If you'd like a second opinion on your current ${svc} setup before committing to a direction, ${co} offers a no-obligation consultation. Thirty minutes of honest conversation can prevent a costly wrong turn.${sgGrants}`
  }

  return `Getting started with **${targetKeyword}** doesn't require a perfect plan or a big project. Here's a practical sequence that works for ${aud}:

**Start with a 30-minute audit**
Before changing anything, spend half an hour honestly reviewing your current ${svc} approach. What's actually working well? What's a workaround that became a habit? What do people on your team quietly complain about? Write it down. This is your baseline — and it shapes everything that comes next.

**Choose one thing to fix first**
Resist the urge to address everything simultaneously. Pick the single improvement that would have the biggest positive impact, and work on that exclusively until it's done. The momentum from one real win is more valuable than five half-finished improvements.

**Define "done" specifically**
Not "improve ${svc}" — but "reduce [specific task] from X to Y by [date]." Specific goals get tracked. Vague goals drift.

**Be honest about what you can handle in-house**
Some aspects of ${targetKeyword} are straightforward to manage internally. Others — particularly those requiring specialist knowledge or significant time investment — are better handled with external support. Being clear about this upfront saves frustration later.

**Build a simple monthly review habit**
Once a month, spend 20–30 minutes reviewing progress. Is the change working? Is there something else that now needs attention? This habit prevents small problems from becoming large ones.

${co} is available to support at any stage — whether you're at the audit step or you've already tried a few approaches and need a fresh perspective.${sgGrants}`
}

function writeEvaluation(h2, brief, project, ctx) {
  const { targetKeyword } = brief
  const { svc, aud, co, loc, isSG, isB2B, isComparison, country, industry, services } = ctx

  if (isComparison) {
    const sgLine = isSG
      ? `\n\n**For Singapore businesses:** Also evaluate whether the provider or solution has genuine experience with local regulatory requirements — ${getLocalHook(ctx, 'regulatory').slice(0, 160)}...`
      : ''
    return `Choosing the right solution for **${targetKeyword}** starts with building the right evaluation framework — not reviewing a features list someone else wrote.

Here are the dimensions that actually drive good decisions:

**1. Genuine fit for your size and stage**
A solution built for enterprise will frustrate a 30-person team. A tool designed for solopreneurs won't scale to 150 people. Before evaluating anything else, filter ruthlessly for whether a solution is actually designed for businesses at your size and growth trajectory.

**2. Implementation reality — not just the demo**
Ask every provider this question: *"Walk me through exactly what happens in the first 30 days of working together."* A specific, honest answer is a good sign. Vagueness at this stage usually means the implementation is harder than the sales conversation suggests — and the support thinner than you were led to believe.

**3. Total cost of ownership, not just the fee**
The contract price is rarely the whole cost. Factor in implementation time, internal resource requirements, training, change management, and ongoing management overhead. A cheaper option that requires significantly more of your team's time may not be cheaper at all.

**4. References from similar businesses**
Ask specifically for references from companies similar to yours in size, industry, and location. Generic case studies on a website are a starting point. A 10-minute conversation with an actual client tells you ten times more.

**5. How they handle problems**
The real test of any provider is not how they perform when everything goes smoothly — it's how they respond when something goes wrong. Ask directly: *"Can you give me an example of a client situation that didn't go to plan, and how you handled it?"* Good partners answer this clearly. Poor ones deflect.${sgLine}

${co} is confident in how we perform against each of these criteria and happy to address them directly.`
  }

  return `When evaluating options for **${targetKeyword}**, the ${aud} that make the best decisions share one habit: they define their own criteria *before* talking to any providers.

Here's a framework to do that:

**Anchor on the problem, not the solution**
Write down — in plain language — the top two or three things you're trying to fix. Every option you evaluate should be measured against those specific problems, not against a generic matrix of features.

**Rank your trade-offs**
Not all factors matter equally for your business. Decide upfront what you're willing to trade off: price vs. capability, speed vs. flexibility, in-house vs. outsourced. Making these explicit before you're in a commercial conversation makes the decision far cleaner.

**Involve the people closest to the work**
The people who handle ${svc} day-to-day will identify practical considerations that aren't visible from a management level. Their input at this stage is invaluable — and involving them early also improves adoption if you move forward.

**Pilot before you commit at scale**
Where possible, run a structured pilot before full rollout. Even a short evaluation period will surface considerations you didn't anticipate — and the cost of course-correcting early is a fraction of what it costs later.

**Weight honesty as a signal**
Be cautious of providers who have a confident answer for everything and never acknowledge limitations. The ones who are clear about where they're strongest — and where they're not — tend to be better partners over time.

${co} works best with ${aud} who value transparency and a structured approach. If that describes you, let's talk.`
}

function writeCost(h2, brief, project, ctx) {
  const { targetKeyword } = brief
  const { svc, aud, co, loc, isSG, isB2B, country, industry, services } = ctx
  const sgGrants = isSG
    ? `\n\n**Singapore SME note:** ${getLocalHook(ctx, 'grants')}`
    : ''

  return `The cost question for **${targetKeyword}** is worth reframing slightly. The relevant number isn't the fee — it's the cost of *not* getting this right.

For most ${aud}, the hidden cost of poor ${svc} shows up across a few areas:

- **Staff time lost** to manual workarounds, error correction, and processes that don't scale
- **Compliance exposure** from gaps in documentation or inconsistent execution
- **Decision-making delays** because reliable data isn't available when it's needed
- **Reactive firefighting** instead of proactive management — the operational tax of a fragile setup

When those costs are made explicit, the investment in quality ${svc} support typically looks very different. Most of our clients find it pays for itself within the first two to three months — not as a projection, but as a measurable reduction in the time and cost associated with the problem being solved.

**How ${co} approaches pricing**
We don't offer one-size-fits-all packages. Pricing reflects your actual situation: the scope of work, the level of support you need, and what a realistic engagement looks like for your business. We're transparent about this from the first conversation — no surprises mid-engagement.

The most efficient way to understand what this looks like for you is a short discovery call. We'll give you a clear picture of what's involved — and a realistic sense of cost — before you commit to anything.${sgGrants}`
}

function writeFeatures(h2, brief, project, ctx) {
  const { targetKeyword } = brief
  const { svc, svcs, aud, co, isBOFU, country, industry } = ctx

  return `Here's what **${targetKeyword}** from ${co} actually includes — and why each element matters for ${aud}.

${svcs.length > 1
    ? svcs.map(s => `**${tc(s)}**\n[Describe specifically what this service involves, what problem it solves for ${aud}, and what "done well" looks like. Be concrete — not "we provide strategic guidance" but "we review your current process, identify the top three friction points, and build a practical improvement plan with clear ownership."]`).join('\n\n')
    : `**${tc(svc)}**\n[Describe the core of what you deliver. Be specific about scope, what's included, what happens at each stage, and what's out of scope. Clarity here builds trust.]`
  }

**What's typically included:**
- Initial assessment and baseline review of your current ${svc} setup
- A customised strategy aligned to your specific business goals and constraints
- Hands-on implementation support — not just recommendations, but delivery
- Regular progress reviews with clear reporting against agreed metrics
- Ongoing access to your dedicated account contact

**What we don't include:**
Being clear about scope is as important as being clear about delivery. ${co} focuses on ${svc} — not every adjacent problem. If a client's needs extend into areas outside our core work, we'll be upfront about that early and, where possible, connect you to the right people.

The clearest way to understand whether our scope matches your needs is a direct conversation. Most questions resolve faster in a 15-minute call than in a back-and-forth email thread.`
}

function writeWhoIsItFor(h2, brief, project, ctx) {
  const { targetKeyword } = brief
  const { svc, aud, co, loc, isSG, country, industry, services } = ctx
  const locPhrase = loc ? ` in ${loc}` : ''

  return `**${tc(targetKeyword)}** from ${co} is built for ${aud} who are past the early "figure it out as we go" stage and ready to build something more deliberate.

**You're a strong fit if:**
- Your current ${svc} setup works, but you know it's not going to hold as you scale
- You've tried to improve ${svc} before, it didn't stick, and you want to understand why
- You need expertise that you don't have — or don't want to build — in-house
- You want a provider who will give you honest feedback, not just tell you what you want to hear
- You're willing to involve the right people in your team in the process

**You're probably not a fit if:**
- You're looking for the cheapest option regardless of quality or long-term outcome
- You need a one-off deliverable without interest in sustainable improvement
- You're not in a position to commit the internal time the process requires

${co} works best with ${aud}${locPhrase} who are serious about getting ${svc} right — not checking a box. If that sounds like your situation, let's find out whether there's a fit.`
}

function writeResults(h2, brief, project, ctx) {
  const { targetKeyword } = brief
  const { svc, aud, co, loc, isSG, isB2B, country, industry, services } = ctx

  return `Here's an honest picture of what ${aud} working with ${co} on **${targetKeyword}** typically experience — without the inflated claims.

**In the first 30 days: clarity**
The most consistent early outcome isn't dramatic results — it's clarity. You know what the actual problems are, what's being done about them, and what to expect. For businesses that have been operating without a clear picture of their ${svc} situation, that clarity alone has real value.

**In months 2 and 3: measurable operational improvement**
The changes start to show. Manual processes become more efficient or get replaced. Common errors reduce. Your team spends less time on ${svc} administration. Most clients can point to specific, measurable improvements at this stage — and they're usually ones they can quantify in time or cost terms.

**At the 6-month mark: a functioning foundation**
The ${svc} infrastructure is in place and running consistently. You have better data to make decisions from. The function supports the business rather than holding it back. New team members can be onboarded into it without the knowledge transfer being someone's full-time job.

**What we can't promise:**
Results depend on your starting point, how actively the right people in your organisation engage with the process, and factors outside our control. What we can guarantee is transparency — if something isn't working as expected, we'll surface it early and adjust.

If you'd like to speak with clients who can share their actual experience, we're happy to facilitate that.`
}

function writeWhyUs(h2, brief, project, ctx) {
  const { targetKeyword } = brief
  const { svc, aud, co, loc, isSG, isB2B, country, industry, services } = ctx
  const locPhrase = loc ? ` in ${loc}` : ''
  const sgCredential = isSG
    ? `\n\n**We know the Singapore context.** That means understanding MOM requirements, CPF implications, relevant grant frameworks, and how businesses here actually operate — not adapting a global playbook that wasn't built for this market.`
    : ''

  return `There are a lot of options for **${targetKeyword}**. Here's what's actually different about working with ${co}.

**We're specific, not general**
${co} works with ${aud}${locPhrase}. Not everyone. That focus means we understand the specific pressures, priorities, and constraints that matter to your type of business — and we don't have to start from a generic template every time.

**We're direct**
If we think you're approaching something the wrong way, we'll say so. If there's a better option for your situation — even if it's not us — we'll tell you. That kind of honesty leads to better outcomes, and it makes for a better working relationship over time.

**We design for your team, not the presentation**
The best ${svc} approach is the one your team will actually use consistently — not the most elegant one in a slide deck. We build for real-world adoption: clear enough for everyone involved, structured enough to scale, practical enough to survive contact with your actual business.${sgCredential}

**We're accountable**
Every engagement includes agreed milestones, clear reporting, and a direct contact you can actually reach. You'll always know where things stand — and if something needs to change, that conversation happens early.`
}

function writeDefinition(h2, brief, project, ctx) {
  const { targetKeyword } = brief
  const { svc, aud, co, loc, isSG, country, industry, services } = ctx
  const locPhrase = loc ? ` in ${loc}` : ''
  const sgLine    = isSG ? `\n\n${getLocalHook(ctx, 'general')}` : ''

  return `**${tc(targetKeyword)}** is — at its core — the practice of [describe the fundamental concept in one plain, specific sentence that your audience would immediately recognise].

For ${aud}${locPhrase}, that translates into something concrete: [describe how this shows up in their day-to-day work or business operations — not abstractly, but in practical terms].

To make this tangible: imagine a [realistic example of a business like the target audience — e.g., "40-person professional services firm with a two-person operations team"]. Without a proper ${svc} setup, they're typically dealing with [specific symptoms: e.g., "manual reconciliation taking 6 hours a week, leave approvals going unanswered for days, and no reliable way to track which team members have completed mandatory training"]. That's not a catastrophic failure — it's just the slow tax of an immature process. And it compounds.

**What ${tc(targetKeyword)} is not:**
It's worth clearing up a few misconceptions. ${tc(targetKeyword)} is often conflated with [commonly confused concept], but they're different in an important way: [brief, clear explanation of the distinction]. It's also not a one-time initiative — the businesses that treat it that way almost always find themselves rebuilding from scratch within 18 months.${sgLine}

The most important thing to understand, especially if you're approaching this for the first time, is [key insight — the thing most people misunderstand or underestimate]. Everything else builds from that.`
}

function writeLocalContext(h2, brief, project, ctx) {
  const { targetKeyword } = brief
  const { svc, aud, co, loc, isSG, country, industry, services } = ctx

  if (isSG) {
    return `Singapore is a specific market — and **${targetKeyword}** looks meaningfully different here than in the UK, Australia, or the US.

${getLocalHook(ctx, 'regulatory')}

**What this means for ${aud} in practical terms**
The regulatory dimension here isn't purely a compliance burden — it's also a source of competitive differentiation for businesses that get it right. Companies with clean, well-documented ${svc} processes tend to perform better in enterprise sales, due diligence reviews, government procurement, and regional expansion — all of which require a level of operational credibility that ad-hoc approaches can't demonstrate.

${getLocalHook(ctx, 'grants')}

**Why working with someone who knows the local context matters**
There's genuine value in engaging a provider who understands Singapore — not just the regulations, but how business actually gets done here: the expectations, the relationships, the pace, and the nuances that don't make it into any framework document.

${co} works specifically with businesses in the Singapore market. That focus keeps us current on regulatory changes, familiar with the grant landscape, and connected to the right specialists when a client's needs extend beyond our core offer.`
  }

  return `Every market has its own dynamics — and **${targetKeyword}** looks different depending on where your business operates.

In ${loc || 'your market'}, the key contextual factors include: [local regulatory environment relevant to ${svc}], [market dynamics that affect how ${aud} make decisions], and [talent or resource constraints specific to the region].

A generic, globally-templated approach to ${svc} often misses these nuances. The result is a strategy or process that looks right on paper but doesn't account for how things actually work in this context.

${co} operates specifically in this market. The support and advice we provide is grounded in local reality — not adapted from a framework built for a different geography.`
}

function writeComparison(h2, brief, project, ctx) {
  const { targetKeyword } = brief
  const { svc, aud, co, loc, isSG, country, industry, services } = ctx

  return `When comparing options for **${targetKeyword}**, the most useful thing you can do is separate the factors that genuinely differentiate solutions from the ones that are mostly marketing noise.

**Factors that actually differentiate:**

- *Genuine fit for your size and context* — Not every solution is built for your scale. Some are enterprise tools with SME pricing; others are genuinely designed for businesses like yours. The implementation experience is completely different.
- *Quality of implementation support* — Many solutions look similar in a demo. The divergence shows up in what happens during and after rollout: how issues are handled, how questions are answered, and how the provider responds when something doesn't go to plan.
- *Real-world references* — Anyone can produce a polished case study. A direct conversation with a client in a similar situation to yours will tell you more in 10 minutes.
- *Total cost, not just headline pricing* — Factor in your team's time during implementation, ongoing management overhead, and the cost of context-switching if you need to switch providers later.

**Factors that sound important but rarely are:**

- Feature count — A longer feature list rarely correlates with better outcomes. Fit does.
- Brand recognition — Market leaders aren't always the best fit for your specific situation.
- Award badges and ratings — These reflect general sentiment, not whether something works for your context.

If you're building a shortlist, ${co} is happy to be evaluated alongside other providers. We'd rather earn the work through a transparent comparison than avoid it.`
}

// ─── Section Dispatcher ────────────────────────────────────────────────────────

function writeSectionBody(h2, brief, project, ctx) {
  const h = h2.toLowerCase()

  if (/benefit|why.*matter|value|why.*important|why.*invest|why.*consider/.test(h))
    return writeBenefits(h2, brief, project, ctx)

  if (/how.*work|step|process|what.*expect|approach|timeline|journey/.test(h))
    return writeHowItWorks(h2, brief, project, ctx)

  if (/mistake|avoid|pitfall|wrong|common error|don.t|trap/.test(h))
    return writeMistakes(h2, brief, project, ctx)

  if (/get started|how to start|begin|first step|action|move forward|next step/.test(h))
    return writeGettingStarted(h2, brief, project, ctx)

  if (/choose|evaluat|look for|consider|select|assess|shortlist|pick the right/.test(h))
    return writeEvaluation(h2, brief, project, ctx)

  if (/compar|vs\b|versus|alternative|option|differ|which/.test(h))
    return writeComparison(h2, brief, project, ctx)

  if (/cost|pric|investment|budget|fee|afford|how much|value for/.test(h))
    return writeCost(h2, brief, project, ctx)

  if (/what.*includ|feature|deliverable|what.*get|offer|package|scope/.test(h))
    return writeFeatures(h2, brief, project, ctx)

  if (/who.*is|right for|suit|ideal|for you|who should|who.*for/.test(h))
    return writeWhoIsItFor(h2, brief, project, ctx)

  if (/result|outcome|roi|return|success|impact|what.*achiev|expect.*from/.test(h))
    return writeResults(h2, brief, project, ctx)

  if (/why.*us|why.*choose|why.*work.*with|differ|what.*set.*apart|advantage/.test(h))
    return writeWhyUs(h2, brief, project, ctx)

  if (/what is|definition|overview|understand|explain|introduc|mean/.test(h))
    return writeDefinition(h2, brief, project, ctx)

  if (/singapore|local market|in malaysia|in indonesia|region|southeast asia|sea/.test(h))
    return writeLocalContext(h2, brief, project, ctx)

  // Intelligent fallback — still context-aware
  return writeDefaultSection(h2, brief, project, ctx)
}

function writeDefaultSection(h2, brief, project, ctx) {
  const { targetKeyword } = brief
  const { svc, aud, co, loc, isSG, country, industry, services } = ctx
  const locPhrase = loc ? ` in ${loc}` : ''
  const sgLine    = isSG ? `\n\n${getLocalHook(ctx, 'market')}` : ''

  return `When it comes to **${stripMarkup(h2)}** in the context of ${targetKeyword}, context determines almost everything.

What works well for one type of ${aud} may not translate directly to another. Size matters. Industry matters. Your team's current capabilities matter. And the specific constraints of your market${locPhrase} matter more than most generic guides acknowledge.

Here's what holds true across most situations: the ${aud} who get the most from ${targetKeyword} approach it with specific goals, realistic timelines, and a genuine willingness to iterate. They don't expect perfection from the first attempt — but they do track progress deliberately and adjust when the data tells them something isn't working.

For ${aud}${locPhrase}, the most important consideration around ${svc} at this stage is [the most relevant challenge or nuance — be specific to the audience and market context]. Understanding this upfront shapes every decision that follows.${sgLine}

If you're unsure how this applies to your situation specifically, ${co} is easy to reach. Sometimes the right answer becomes obvious in a 20-minute conversation.`
}

// ─── FAQ Section ──────────────────────────────────────────────────────────────

function writeFAQSection(faqs) {
  if (!faqs || faqs.length === 0) return ''
  return faqs.map(faq => `### ${faq.q}\n\n${faq.a}`).join('\n\n')
}

// ─── Conclusion by Funnel × Page Type ────────────────────────────────────────

function writeConclusion(brief, project, ctx) {
  const { targetKeyword, cta } = brief
  const { svc, aud, co, loc, isSG, isB2B, isBOFU, isMOFU, isTOFU,
          isServicePage, country, industry, services } = ctx
  const locPhrase  = loc ? ` in ${loc}` : ''
  const ctaLabel   = cta?.buttonLabel || 'Get in touch'

  // ── BOFU: Service page ──────────────────────────────────────────────────────
  if (isBOFU && isServicePage) {
    return `If **${targetKeyword}** is something your business needs to get right — and you're weighing up whether ${co} is the right partner — the most efficient next step is a short discovery call.

It's 30 minutes. We'll ask about your current situation, what you've tried before, and what success looks like for your business. You'll have the chance to ask us about our process, our experience, and what working together actually looks like.

No pressure, no commitment. If it's a genuine fit, we'll both know. If it's not, you'll leave with more clarity than you came in with — which has its own value.

**${ctaLabel}** — and let's see if there's a fit.`
  }

  // ── BOFU: Not service page ──────────────────────────────────────────────────
  if (isBOFU) {
    return `You've done the research. You have a sense of what **${targetKeyword}** involves and what a good outcome looks like. The remaining question is whether ${co} is the right partner for your specific situation.

The most efficient way to answer that is a direct conversation. Come with your hardest questions — we'd rather address them upfront than discover they're blockers three months in.

**${ctaLabel}** — and let's figure out together whether we're the right fit.`
  }

  // ── MOFU ──────────────────────────────────────────────────────────────────
  if (isMOFU) {
    return `The research phase of **${targetKeyword}** gets you to a point — but at some stage, the most useful next step is a conversation with someone who's navigated this with businesses in your situation before.

If you'd like a no-obligation perspective on your specific context — not a sales pitch — ${co} is easy to reach. We'll tell you what we'd recommend, be honest about whether we're the right fit, and respect your time.

**${ctaLabel}** and tell us a bit about where you are. We'll tell you what we think.`
  }

  // ── TOFU: B2B ─────────────────────────────────────────────────────────────
  if (isTOFU && isB2B) {
    return `**${tc(targetKeyword)}** is one of those areas where the gap between a good approach and a poor one compounds over time. The businesses that get this right don't necessarily have more resources — they made better decisions earlier, and they built from there.

If this article surfaced questions specific to your situation — or if you'd like an honest second opinion on your current ${svc} setup — ${co} offers a free 30-minute review call. No pitch, no pressure. Just a focused conversation.

Most people leave with at least two or three concrete things they can act on immediately.

**${ctaLabel}** — or reach out directly if you have a specific question in mind.`
  }

  // ── TOFU: General ──────────────────────────────────────────────────────────
  return `Understanding **${targetKeyword}** is the first step. Acting on it is the one that actually changes things.

The difference between businesses${locPhrase} that get ${svc} right and those that don't rarely comes down to knowledge or intent. It comes down to having the right support at the right time — and being willing to move from research to action.

${co} works with ${aud}${locPhrase} who are at that stage. If that's you, **${ctaLabel}** — and let's talk about what's possible.`
}

// ─── Main Generator ───────────────────────────────────────────────────────────

export function generateContent(brief, project) {
  if (!brief || !project) return null

  const { suggestedH1, h2s = [], faqs = [], targetKeyword, meta } = brief
  const ctx      = buildCtx(brief, project)
  const sections = []

  // Title
  sections.push(`# ${suggestedH1}`)
  sections.push('')

  // Introduction
  sections.push(writeIntro(brief, project, ctx))
  sections.push('')

  // Main body H2 sections — skip last 2 (FAQ + Conclusion)
  const bodyH2s = h2s.slice(0, -2)
  bodyH2s.forEach(h2 => {
    sections.push(`## ${h2}`)
    sections.push('')
    sections.push(writeSectionBody(h2, brief, project, ctx))
    sections.push('')
  })

  // FAQ Section
  const faqH2 = h2s.find(h => /faq|question/i.test(h)) || 'Frequently Asked Questions'
  sections.push(`## ${faqH2}`)
  sections.push('')
  sections.push(writeFAQSection(faqs))
  sections.push('')

  // Conclusion / CTA
  const ctaH2 = h2s[h2s.length - 1] || 'Next Steps'
  sections.push(`## ${ctaH2}`)
  sections.push('')
  sections.push(writeConclusion(brief, project, ctx))

  const body      = sections.join('\n')
  const wordCount = body.split(/\s+/).filter(Boolean).length

  return {
    id:              generateId(),
    briefId:         brief.id,
    targetKeyword,
    title:           suggestedH1,
    metaTitle:       meta?.title || suggestedH1,
    metaDescription: meta?.description || '',
    slug:            brief.slug || '',
    body,
    wordCount,
    createdAt:       new Date().toISOString(),
  }
}
