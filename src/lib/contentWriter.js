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

function pick(arr) {
  return arr[Math.floor(arr.length * 0.37)]
}

// ─── Context Builder ──────────────────────────────────────────────────────────

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

  const isSG       = /singapore/i.test(country || '')
  const isVietnam  = /vietnam/i.test(country || '')
  const isMalaysia = /malaysia/i.test(country || '')
  const isLocal    = isSG || isVietnam || isMalaysia || (country && !/global|remote/i.test(country))
  const loc        = isLocal ? country : ''
  const locPhrase  = loc ? ` in ${loc}` : ''

  const isB2B = /\b(b2b|enterprise|manager|director|cto|cfo|ceo|hr|operations|procurement|startup|sme|company|companies|businesses|team|founder|exec)\b/i.test(targetAudience || '')

  const isServicePage = /service|landing/i.test(pageType)
  const isBlog        = /blog|guide|article/i.test(pageType)
  const isComparison  = /comparison/i.test(pageType)
  const isFAQPage     = /faq/i.test(pageType)

  const isBOFU = funnel === 'BOFU'
  const isMOFU = funnel === 'MOFU'
  const isTOFU = funnel === 'TOFU'

  return {
    targetKeyword, funnel, pageType, svc, svcs, aud, allAuds, co,
    isSG, isVietnam, isMalaysia, isLocal, loc, locPhrase,
    isB2B, isServicePage, isBlog, isComparison, isFAQPage,
    isBOFU, isMOFU, isTOFU,
    country, industry: ind, tone, services, svcLower, companyName,
  }
}

// ─── Singapore / Local Market Context ─────────────────────────────────────────

function getLocalHook(ctx, type = 'general') {
  const { isSG, isVietnam, isMalaysia, svcLower, industry, loc } = ctx

  if (isSG) {
    if (/hr|human resource|payroll|recruitment|hiring|talent|employee|workforce|leave|attendance/.test(svcLower + industry)) {
      const hooks = {
        regulatory: `In Singapore, employers must navigate MOM regulations, CPF contribution rules, Fair Consideration Framework (FCF) requirements, and — for companies on Work Pass quotas — monthly foreign worker levy calculations. Even well-run businesses make costly errors when these processes aren't properly systemised.`,
        market:     `Singapore's labour market is one of the tightest in the region. With local employment at near-full levels, the cost of losing a good employee — or failing to attract the right one — is significantly higher than it was five years ago. HR processes that create friction at any stage of the employee lifecycle are no longer a minor inconvenience; they're a business risk.`,
        grants:     `Singapore businesses can tap the Productivity Solutions Grant (PSG) and Enterprise Development Grant (EDG) to subsidise qualifying HR software and consulting investments. Depending on scope, SMEs may recover 50–80% of eligible costs. If you haven't reviewed your grant eligibility recently, it's worth doing before committing to any investment.`,
        general:    `For Singapore businesses, getting HR right is both an operational and a compliance challenge. MOM regulations, CPF requirements, and Employment Act provisions create a framework where mistakes — even unintentional ones — have real consequences. Building the right infrastructure early makes everything easier to manage as your headcount grows.`,
      }
      return hooks[type] || hooks.general
    }

    if (/finance|accounting|fintech|payment|invoice|tax|gst|audit|bookkeeping|cash flow|budget/.test(svcLower + industry)) {
      const hooks = {
        regulatory: `Singapore businesses must meet IRAS GST filing requirements, ACRA annual return deadlines, and — for registered entities — XBRL financial reporting standards. The consequences of non-compliance range from financial penalties to reputational damage, particularly for businesses seeking external investment or government contracts.`,
        market:     `Singapore's position as a regional financial centre means the bar for financial governance is high. Investors, banks, and enterprise clients increasingly scrutinise how well a business manages its finances operationally — not just at year-end.`,
        grants:     `SMEs in Singapore can access support through Enterprise Singapore and the IMDA SMEs Go Digital programme to modernise financial management systems. Some solutions qualify under the PSG pre-approved vendor list, which simplifies the grant application process significantly.`,
        general:    `For Singapore businesses, financial management sits at the intersection of operational efficiency and regulatory compliance. Between GST reporting, XBRL filing, and IRAS requirements, the administrative burden on growing companies is real — and the risk of getting it wrong grows with the business.`,
      }
      return hooks[type] || hooks.general
    }

    if (/saas|software|tech|digital|cloud|platform|app|system|data|api|automation/.test(svcLower + industry)) {
      const hooks = {
        regulatory: `Singapore-based technology companies operating in regulated sectors must align with MAS Technology Risk Management (TRM) guidelines and the Personal Data Protection Act (PDPA). For those handling cross-border data, the PDPC's advisory guidelines on overseas transfers add another layer of consideration. Building compliance into your architecture from the start is meaningfully cheaper than retrofitting it later.`,
        market:     `Singapore's role as Southeast Asia's technology hub creates genuine opportunity — but also intense competition. The businesses that grow beyond the local market are typically those that have built operationally sound foundations: reliable infrastructure, clean processes, and strong customer success practices that don't require reinvention at every growth stage.`,
        grants:     `The IMDA SMEs Go Digital programme, Digital Resilience Bonus, and Enterprise Singapore's Scale-Up SG initiative all offer relevant support for technology companies at different stages. If you're investing in capability-building — new infrastructure, team development, or market expansion — it's worth mapping your activities against available grants before finalising your budget.`,
        general:    `Singapore's technology sector is maturing fast. Local and regional competition is sharper than it was three years ago, and the expectations of enterprise buyers — in Singapore and across the region — have risen accordingly. The businesses gaining ground are the ones that treat operational excellence as a competitive advantage, not an afterthought.`,
      }
      return hooks[type] || hooks.general
    }

    if (/legal|law|consulting|advisory|professional service|strategy|management/.test(svcLower + industry)) {
      const hooks = {
        regulatory: `Singapore professional services firms operate in a highly regulated environment. Whether you're dealing with Law Society requirements, public accountancy regulations, or sector-specific licensing, staying current on obligations — and demonstrating that to clients — is a baseline expectation.`,
        market:     `Singapore's professional services market is sophisticated. Clients — particularly corporate and institutional ones — evaluate providers not just on technical competence but on operational reliability, data handling practices, and the quality of their client communication.`,
        general:    `For professional services firms in Singapore, the competitive landscape has changed. Price competition from regional providers and the increasing capability of technology-enabled alternatives means that operational excellence — how reliably and efficiently you deliver — is now a key differentiator.`,
      }
      return hooks[type] || hooks.general
    }

    if (/real estate|property|landlord|tenant|rental|leasing|mortgage|conveyancing/.test(svcLower + industry)) {
      const hooks = {
        regulatory: `Singapore's property market operates under URA guidelines, HDB regulations, and ABSD frameworks that change with some regularity. Staying current on regulatory shifts — and communicating those changes clearly to clients — is part of what separates credible operators from the rest.`,
        general:    `Singapore's property market is one of the region's most active and closely regulated. For businesses operating in this space, navigating ABSD policies, stamp duties, and URA planning requirements while delivering quality client service requires both expertise and operational discipline.`,
      }
      return hooks[type] || hooks.general
    }

    if (/logistic|supply chain|freight|shipping|warehouse|trade|import|export|customs/.test(svcLower + industry)) {
      const hooks = {
        regulatory: `Singapore's position as a global trade hub comes with a sophisticated customs and regulatory framework administered by Singapore Customs and the Port of Singapore Authority. Businesses handling cross-border trade need processes that are both efficient and audit-ready.`,
        general:    `As one of the world's busiest ports, Singapore is at the centre of regional and global supply chains. Businesses operating in this space face constant pressure on margins, turnaround times, and reliability — and the operational systems supporting the business need to match that pace.`,
      }
      return hooks[type] || hooks.general
    }

    const general = {
      regulatory: `Singapore's regulatory environment is among the most rigorous in Asia. Whether you're navigating employment law, data protection requirements, financial reporting obligations, or sector-specific licensing, the details matter — and the cost of getting them wrong tends to surface at the worst possible time.`,
      market:     `Singapore SMEs operate in a high-cost, high-expectation market. The businesses that compete successfully tend to be operationally sharp — they've systemised the repeatable parts of their operation so their best people can focus on work that genuinely requires them.`,
      grants:     `Singapore's grant landscape for SMEs is genuinely useful — but underutilised. The PSG, EDG, SkillsFuture Enterprise Credit, and various MCI and EnterpriseSG programmes cover a wide range of capability-building activities. The challenge is knowing what's available and structuring your investment to qualify.`,
      general:    `Singapore is a high-cost, high-efficiency market. Businesses that thrive here tend to be lean and operationally deliberate — they've solved the right problems with the right resources, rather than growing headcount to compensate for process gaps.`,
    }
    return general[type] || general.general
  }

  if (isVietnam) {
    const isHR = /hr|payroll|hiring|recruit|staffing|employee|workforce|eor|employer of record/i.test(svcLower + industry)
    const isFinance = /finance|accounting|tax|gst|audit|bookkeep/i.test(svcLower + industry)

    if (isHR) {
      const hooks = {
        regulatory: `In Vietnam, employment is governed by the Labor Code 2019. Statutory contributions include BHXH (social insurance — employer 17.5%), BHYT (health insurance — employer 3%), and BHTN (unemployment insurance — employer 1%). Trade union fees of 2% of the payroll fund apply separately. Foreign workers require work permits, and non-compliance in any of these areas carries real enforcement risk.`,
        market:     `Vietnam's labour market is growing rapidly, particularly in the FDI and technology sectors. Competition for experienced mid-level talent is intense, and the speed of hiring — not just its quality — is increasingly a competitive factor. Businesses that can hire compliantly and quickly have a structural advantage.`,
        general:    `For businesses managing Vietnam headcount, the combination of statutory complexity and a fast-moving labour market creates a meaningful operational challenge. Getting the BHXH, BHYT, and BHTN calculations right — consistently, every cycle — is the baseline. Building a reliable hiring process on top of that is where the real competitive advantage comes from.`,
        grants:     `Vietnam's FDI incentive framework varies by sector, location, and investment scale. Technology, manufacturing, and certain service sectors qualify for corporate income tax (CIT) preferences and import duty exemptions. If you're evaluating market entry or expansion, understanding the applicable incentives before committing to a structure is worth doing early.`,
      }
      return hooks[type] || hooks.general
    }

    if (isFinance) {
      const hooks = {
        regulatory: `Vietnam's tax framework is administered by the General Department of Taxation (GDT). Key obligations include VAT at 10% (standard rate), Corporate Income Tax (CIT) at 20% for standard entities, and Withholding Tax (WHT) on payments to foreign entities. Transfer pricing documentation requirements have become more rigorous, particularly for FDI businesses with related-party transactions.`,
        general:    `For businesses operating in Vietnam, financial compliance requires current knowledge of GDT requirements and the discipline to apply them consistently. Monthly VAT and CIT provisional payments, combined with annual finalisation obligations, create a steady compliance cadence that is best managed with the right processes and specialist support.`,
      }
      return hooks[type] || hooks.general
    }

    return `Vietnam's business environment is evolving rapidly, and the regulatory framework around ${firstOf(ctx.services)} reflects that pace. The Labor Code 2019, the GDT's tax administration framework, and sector-specific licensing requirements all create a compliance landscape that differs meaningfully from Singapore or Malaysia. Businesses that understand these specifics — rather than applying a regional template — build on a much stronger foundation.`
  }

  if (isMalaysia) {
    const isHR = /hr|payroll|hiring|recruit|staffing|employee|workforce|eor|employer of record/i.test(svcLower + industry)
    const isFinance = /finance|accounting|tax|gst|audit|bookkeep/i.test(svcLower + industry)

    if (isHR) {
      const hooks = {
        regulatory: `Malaysia's Employment Act 1955 (and its recent amendments) governs most employment relationships. Statutory contributions include EPF (employer 13% for employees earning RM5,000 and below, 12% above), SOCSO, and EIS. Monthly payroll tax deduction (PCB/MTD) is administered by LHDN. Employers meeting the headcount threshold must also comply with HRD Corp levy requirements — which fund training grants that qualifying businesses can draw from.`,
        market:     `Malaysia's labour market is active across multiple sectors, particularly in financial services, manufacturing, and technology. The Employment Act amendments have expanded employee protections, which means businesses need to stay current on legislative changes to remain compliant. The cost of getting employment law wrong — in claims or regulatory scrutiny — has increased.`,
        general:    `For businesses managing Malaysia headcount, the combination of EPF, SOCSO, EIS, PCB, and HRD Corp requirements creates a compliance framework that is more complex than it might first appear. Getting every element right — consistently, on time — requires either significant internal capability or the right specialist support.`,
        grants:     `Malaysia's HRD Corp levy framework, SME Corp programmes, and MDEC initiatives offer genuine support for qualifying businesses. HRD Corp grants in particular can offset training and capability-development investments significantly. If you're spending on team development or system implementation, understanding your grant entitlement before you commit your budget is a practical first step.`,
      }
      return hooks[type] || hooks.general
    }

    if (isFinance) {
      const hooks = {
        regulatory: `Malaysia's tax compliance is administered by LHDN (Lembaga Hasil Dalam Negeri). The Sales and Service Tax (SST) framework replaced GST in 2018 — service tax is currently 6% on taxable services, and sales tax applies to specific goods categories. Corporate income tax for SMEs qualifying for the reduced rate is 17% on the first RM600,000 of chargeable income; the standard rate is 24%.`,
        general:    `For businesses operating in Malaysia, financial governance involves navigating LHDN requirements, SST obligations, and the various statutory filings that accompany Malaysian company administration. Getting these right — and having clean, audit-ready financials — is both a compliance requirement and an operational advantage.`,
      }
      return hooks[type] || hooks.general
    }

    return `Malaysia's business environment is one of Southeast Asia's most developed, and the regulatory framework around ${firstOf(ctx.services)} reflects that maturity. The Employment Act, EPF/SOCSO/EIS statutory framework, LHDN tax administration, and various sector-specific requirements create a compliance environment that rewards businesses with strong operational infrastructure — and penalises those that rely on informal approaches.`
  }

  if (loc) {
    return `For businesses in ${loc}, the specific context around ${firstOf(ctx.services)} includes local regulatory requirements, market dynamics, and competitive factors that a generic approach often fails to address. Understanding this context is part of how ${ctx.co} delivers results that are actually relevant to your situation.`
  }

  return ''
}

// ─── Introduction Variants ────────────────────────────────────────────────────

function writeIntro(brief, project, ctx) {
  const { targetKeyword, cta } = brief
  const { svc, aud, co, locPhrase, loc, isSG, isB2B, isBOFU, isMOFU, isTOFU,
          isServicePage, isBlog, isComparison, industry, services, country } = ctx

  if (isBOFU && isServicePage) {
    const sgLine = isSG ? `\n\n${getLocalHook(ctx, 'general')}` : ''
    return `Most ${aud} who land on this page have already done their research. You understand what **${targetKeyword}** involves, you've probably compared a few options, and now you're deciding whether ${co} is the right fit for your business.

That's a fair question — and this page answers it directly.

Below you'll find exactly what our ${svc} service covers, how the process works from day one, who it's best suited for, and what results our clients typically see.${sgLine} If something here doesn't answer your question, we're easy to reach.`
  }

  if (isBOFU) {
    return `You've probably been thinking about **${targetKeyword}** for a while. You've had internal conversations, looked at a few options, and now you're getting close to a decision.

This page has one goal: give you a clear, complete picture of what working with ${co} actually looks like — so you can make a confident call without needing three more calls to get there.

We'll cover scope, process, timelines, expectations, and the questions most ${aud} ask before they start. No pressure, no pitch — just the information you need.`
  }

  if (isMOFU && isComparison) {
    return `If you're researching **${targetKeyword}** options, be cautious of comparison articles that don't acknowledge trade-offs. Most "best of" lists are written to rank — not to actually help you decide.

The honest answer is: the right solution depends on your specific situation. Your team size, budget, internal capabilities, and growth stage all change the equation significantly. What works well for a 200-person company may be the wrong choice for a 25-person team — even in the same industry.

This guide is designed to help you build the right evaluation framework for your context. By the end, you'll have a clear set of criteria to apply — and a list of questions worth asking any provider you're considering.`
  }

  if (isMOFU) {
    const b2bLine = isB2B
      ? `\n\nIf you're evaluating this on behalf of your organisation, we've also included a section on how to build the internal case — because getting buy-in from the right stakeholders is often half the challenge.`
      : `\n\nBy the end of this guide, you'll have a clear framework for evaluating your options and a short set of questions worth asking before committing.`
    return `Choosing the right approach to **${targetKeyword}** is harder than it should be. There's too much vendor noise, too many "solutions" that solve the wrong problem, and not enough honest guidance on what actually works for businesses like yours.

This guide cuts through that. We're going to walk you through the factors that genuinely matter — and the ones that sound important but rarely are — so you can make a decision you won't regret six months from now.${b2bLine}`
  }

  if (isTOFU && isBlog) {
    const openings = [
      `Most ${aud} don't set out to get **${targetKeyword}** wrong. They start with a reasonable approach — a spreadsheet here, a manual process there — and it works until it doesn't.`,
      `Here's an honest question worth sitting with: is the way you're currently handling **${targetKeyword}** actually working, or has it just become too familiar to question?`,
      `There's a version of **${targetKeyword}** that genuinely moves the needle for ${aud} — and a version that keeps the team busy without improving much. The difference usually comes down to a few fundamental decisions made early.`,
    ]
    const opening = openings[0]
    const sgLine  = isSG
      ? `\n\nFor businesses${locPhrase}, there's also a compliance dimension to consider — one that catches even experienced operators off-guard. We'll cover that too.`
      : ''
    return `${opening}

This guide explains what **${targetKeyword}** actually involves, why it matters for ${aud}, and what a practical, no-fluff approach looks like in practice. You'll find a breakdown of common mistakes and a clear path to getting it right — whether you're starting from scratch or improving something that already exists.${sgLine}

If you're early in your research, start at the beginning. If you've already got a foundation and want to pressure-test it, skip to the section that's most relevant to your situation.`
  }

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
"Improve ${svc}" is too vague to act on. A good target sounds more like: "Reduce the time required to complete a specific task from X hours to Y hours by a given date." Specific, measurable, and bounded. Vague goals drift; specific ones get done.

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
Not "improve ${svc}" — but "reduce a specific task from X to Y by a given date." Specific goals get tracked. Vague goals drift.

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
Ask every provider this question: *"Walk me through exactly what happens in the first 30 days of working together."* A specific, honest answer is a good sign. Vagueness at this stage usually means the implementation is harder than the sales conversation suggests.

**3. Total cost of ownership, not just the fee**
The contract price is rarely the whole cost. Factor in implementation time, internal resource requirements, training, change management, and ongoing management overhead.

**4. References from similar businesses**
Ask specifically for references from companies similar to yours in size, industry, and location. A 10-minute conversation with an actual client tells you ten times more than a polished case study.

**5. How they handle problems**
The real test of any provider is not how they perform when everything goes smoothly — it's how they respond when something goes wrong. Ask directly: *"Can you give me an example of a client situation that didn't go to plan, and how you handled it?"*${sgLine}

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
  const sgGrants = isSG ? `\n\n**Singapore SME note:** ${getLocalHook(ctx, 'grants')}` : ''

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
  const { svc, svcs, aud, co, isBOFU, country, industry, svcLower } = ctx

  function describeService(s) {
    const sl = s.toLowerCase()

    if (/recruitment|executive search|headhunt|talent search|hiring|talent acqui/i.test(sl)) {
      return `**${tc(s)}**
${co}'s recruitment process is built for ${aud} who need the right hire, not just a fast one. We manage sourcing, screening, and shortlisting so your team only meets candidates who genuinely meet the brief. For senior and specialist roles, we use direct search methods to reach candidates who aren't actively looking — which is where the highest-quality talent often sits. Every shortlist comes with a clear rationale, and we stay involved through to offer and acceptance to reduce the risk of a late-stage fall-through.`
    }

    if (/staffing|hr outsourc|manpower|contract staff|workforce|temp staff/i.test(sl)) {
      return `**${tc(s)}**
Our staffing service gives ${aud} access to pre-vetted, contract-ready talent without the overhead of direct employment. Whether you need to scale quickly for a project, cover a leave absence, or test a role before committing to a permanent hire, we handle sourcing, vetting, and employment administration. You get the capacity; we handle the complexity — including statutory contributions, payslip processing, and leave management for all placed staff.`
    }

    if (/employer of record|eor|peo|professional employer org/i.test(sl)) {
      return `**${tc(s)}**
For ${aud} expanding into new markets or hiring across borders, ${co}'s Employer of Record (EOR) service handles the legal employment infrastructure — local employment contracts, statutory contributions, payroll processing, and compliance reporting — so you can hire compliantly without establishing a legal entity in the country. This is particularly relevant for businesses entering or expanding across Southeast Asia, where employment law and statutory requirements vary significantly by country. We currently support EOR arrangements in Singapore, Malaysia, Vietnam, and several other regional markets.`
    }

    if (/payroll|salary admin|compensation admin|remuneration/i.test(sl)) {
      return `**${tc(s)}**
Our payroll service handles the end-to-end salary cycle for ${aud}: monthly calculations, statutory deductions, payslip generation, payment processing, and compliance reporting. Every cycle is reviewed before disbursement — discrepancies are flagged before they reach employees, not after. For multi-country payroll, we manage country-specific requirements and statutory filing deadlines separately, with one consolidated report and a single point of contact across all markets. CPF, EPF, BHXH, or whichever statutory schemes apply to your headcount — we handle each one correctly.`
    }

    if (/finance|accounting|bookkeep|tax|gst|audit/i.test(sl)) {
      return `**${tc(s)}**
Our finance and accounting service gives ${aud} clean, audit-ready financials without building a full in-house finance function. We handle bookkeeping, month-end close, GST/tax filing, and management reporting — with the added benefit of a team that understands the local regulatory environment in the markets where you operate. Whether it's IRAS GST returns in Singapore, LHDN PCB in Malaysia, or GDT filings in Vietnam, compliance is embedded into how we work, not treated as an afterthought.`
    }

    if (/saas|software|tech|digital|cloud|platform|automation/i.test(sl)) {
      return `**${tc(s)}**
Our ${tc(s)} service is built for ${aud} who need capability without complexity. We handle implementation, configuration, integration with existing tools, and ongoing support — so your team can use the technology effectively rather than spending time managing it. We're also honest about fit: if a solution isn't right for your situation, we'll say so before you commit, not after you've signed.`
    }

    return `**${tc(s)}**
Our ${tc(s)} service for ${aud} is designed around your actual operating context — not a generic template. We begin with a structured discovery to understand where things stand, define what a measurable improvement looks like for your specific situation, and deliver against that standard with clear reporting throughout. Scope, timeline, and success metrics are agreed before we start.`
  }

  const serviceDescriptions = svcs.length > 1
    ? svcs.map(s => describeService(s)).join('\n\n')
    : describeService(svc)

  return `Here's what **${targetKeyword}** from ${co} actually includes — and why each element matters for ${aud}.

${serviceDescriptions}

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
  const { svc, aud, co, loc, isSG, country, industry, services, svcLower } = ctx
  const locPhrase = loc ? ` in ${loc}` : ''
  const sgLine    = isSG ? `\n\n${getLocalHook(ctx, 'general')}` : ''
  const kw        = targetKeyword.toLowerCase()

  let coreDef, practicalMeaning, example, misconception, miscExp, keyInsight

  if (/recruitment|hiring|talent acquisition|headhunt/i.test(svcLower + kw)) {
    coreDef         = 'identifying, attracting, and selecting the right people for specific roles within an organisation — with enough precision that the hire works out well, not just on paper but in practice'
    practicalMeaning = `a structured process of defining what "right" actually means for each role, finding candidates who match that definition (including those who aren\'t actively looking), and evaluating them rigorously before a decision is made`
    example         = `a 60-person professional services firm trying to hire a finance manager. Without a structured recruitment process, they spend six weeks reviewing 80 applications, most of which don\'t meet the brief. They interview 12 people, make an offer to their second choice, and three months later the hire isn\'t working out. With a proper recruitment approach, the brief is sharper, the sourcing is targeted, and the shortlist contains three genuinely strong candidates — the process takes the same time, but the outcome is consistently better`
    misconception   = 'posting a job advertisement on a job board'
    miscExp         = `that\'s one sourcing channel among many, and often not the most effective one for specialist or senior roles. The candidates who are most in demand are frequently not actively searching — finding them requires direct outreach and a compelling approach`
    keyInsight      = `the quality of the brief determines the quality of the hire. A vague brief produces a vague shortlist. A well-defined understanding of the role, the team, and what success looks like in the first 90 days is the most important input in any recruitment process`
  } else if (/payroll|salary|remuneration|compensation admin/i.test(svcLower + kw)) {
    coreDef         = 'the end-to-end process of calculating, processing, and disbursing employee compensation accurately, on time, and in compliance with all applicable tax and statutory obligations'
    practicalMeaning = `monthly salary calculations, statutory deduction management (CPF, EPF, income tax, social contributions), payslip generation, payment processing, and regulatory reporting — all running without errors and on schedule, every cycle`
    example         = `a growing company with 45 employees across two countries. Without a proper payroll setup, they\'re manually calculating salary adjustments in a spreadsheet, missing the occasional statutory contribution, and handling end-of-year tax reporting under pressure. Employees occasionally receive incorrect payslips. With a structured payroll process, every cycle runs cleanly, statutory contributions are calculated and filed correctly, and employees receive accurate payslips on the same date every month`
    misconception   = 'a simple administrative task'
    miscExp         = `for most organisations, payroll involves complex statutory calculations, country-specific compliance requirements, and the kind of errors that have real consequences — for employees and for the business`
    keyInsight      = `payroll errors are expensive in ways that don\'t always show up immediately. Incorrect statutory contributions create compliance exposure; late payments erode employee trust; underpaid tax creates liability. Getting payroll right is a risk management function as much as an administrative one`
  } else if (/employer of record|eor|peo/i.test(svcLower + kw)) {
    coreDef         = 'a service where a third-party organisation (the Employer of Record) takes on the legal responsibilities of employing staff on behalf of a client company — handling employment contracts, payroll, statutory contributions, and compliance in a given country while the client retains day-to-day management of the employee\'s work'
    practicalMeaning = `the ability to hire employees in a country where you don\'t have a legal entity, compliantly and quickly — without the time, cost, and complexity of setting up and maintaining a local subsidiary`
    example         = `a Singapore-based company that wants to hire two sales managers in Malaysia and one operations lead in Vietnam. Setting up entities in both countries would take months and require ongoing local compliance management. Using an EOR, they can onboard all three employees within weeks, with contracts, payroll, and statutory contributions handled locally in each country — while the hiring manager manages the work directly from Singapore`
    misconception   = 'a loophole or grey-area arrangement'
    miscExp         = `a properly structured EOR is a fully compliant employment model. The EOR is the legal employer; the client is the operational manager. All statutory obligations are met in the country of employment`
    keyInsight      = `the EOR model works best for companies testing a new market, scaling a small team internationally, or hiring in countries where building a legal entity isn\'t yet commercially justified. It\'s a legitimate and increasingly common model for cross-border hiring in Southeast Asia`
  } else if (/staffing|manpower|workforce|contract staff/i.test(svcLower + kw)) {
    coreDef         = 'the practice of placing contracted or temporary workers into an organisation to meet specific capacity needs — whether for a defined project, to cover an absence, or to provide flexible headcount that can be scaled without the overhead of permanent employment'
    practicalMeaning = `access to pre-vetted, contract-ready talent on timelines that permanent hiring can\'t match — typically days to weeks rather than months — with the staffing provider handling employment administration, statutory contributions, and compliance`
    example         = `a mid-sized company that wins a large contract requiring additional staff for six months. Direct hiring at that volume and speed isn\'t realistic. Through a staffing partner, they get pre-screened, briefed workers within two weeks, with all employment admin handled by the provider — and the flexibility to scale down once the contract completes without redundancy exposure`
    misconception   = 'a lower-quality alternative to permanent hiring'
    miscExp         = `for the right use cases — projects, coverage, market testing — contract staffing is often the smarter choice. Many of the best contract workers actively choose flexible arrangements; the talent pool is broader than many businesses expect`
    keyInsight      = `the value of staffing isn\'t just speed — it\'s the flexibility to match headcount to actual business need without the fixed costs and obligations of permanent employment. In volatile or seasonal businesses, this flexibility is a genuine competitive advantage`
  } else if (/hr outsourc|human resources/i.test(svcLower + kw)) {
    coreDef         = 'the practice of delegating HR functions — such as payroll, recruitment, compliance, employee relations, and HR administration — to an external provider, rather than managing them entirely in-house'
    practicalMeaning = `your company retains strategic control over people decisions, while the operational and administrative burden of running HR is handled by a specialist team — giving you the output of an HR department without necessarily building one`
    example         = `a 35-person professional services firm where two senior managers are currently splitting their time between client work and HR admin. With HR outsourcing, the administration — payroll, leave management, contract management, statutory filings — transfers to an external provider. The managers get their time back. The HR function gets more consistent`
    misconception   = 'only relevant for large companies'
    miscExp         = `HR outsourcing is often most valuable for growing businesses at the 20–100 headcount stage — big enough for HR to be a real operational burden, but not yet ready for a full in-house team`
    keyInsight      = `the biggest benefit of HR outsourcing isn\'t cost — it\'s the combination of specialist knowledge and consistent execution that most small and mid-sized businesses can\'t replicate in-house`
  } else {
    coreDef         = `a structured approach to managing ${svc} in a way that\'s consistent, measurable, and aligned to the specific needs of your business and the markets you operate in`
    practicalMeaning = `your team spends less time managing ${svc} manually, less time correcting errors, and more time on work that actually drives results. Decisions are made with better information. The process is repeatable, even as the team grows`
    example         = `a ${aud} dealing with a ${svc} process that started as a manual workaround and never quite evolved. It works most of the time — but when it doesn\'t, the consequences are visible: errors that take time to fix, delays that affect downstream decisions, and team members carrying knowledge that should be in a system`
    misconception   = 'a one-time project with a clear end date'
    miscExp         = `${tc(svc)} requires ongoing attention and periodic review. The businesses that treat it as a set-and-forget exercise typically find themselves starting over 12–18 months later`
    keyInsight      = `the businesses that get ${svc} right early create compounding benefits — every team member hired, every client onboarded, and every market entered runs against a better foundation`
  }

  return `**${tc(targetKeyword)}** is — at its core — ${coreDef}.

For ${aud}${locPhrase}, that translates into something concrete: ${practicalMeaning}.

To make this tangible: imagine ${example}. That's not a catastrophic failure — it's the slow tax of an immature process. And it compounds.

**What ${tc(targetKeyword)} is not:**
It's worth clearing up a common misconception. ${tc(targetKeyword)} is often conflated with ${misconception}, but they're different in an important way: ${miscExp}. It's also not a one-time initiative — the businesses that treat it that way almost always find themselves rebuilding from scratch within 18 months.${sgLine}

The most important thing to understand, especially if you're approaching this for the first time, is ${keyInsight}. Everything else builds from that.`
}

function writeLocalContext(h2, brief, project, ctx) {
  const { targetKeyword } = brief
  const { svc, aud, co, loc, isSG, isVietnam, isMalaysia, country, industry, services, svcLower } = ctx

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

  if (isVietnam) {
    const isHR = /hr|payroll|hiring|recruit|staffing|employee|workforce|eor|employer of record/i.test(svcLower + industry)
    const isFinance = /finance|accounting|tax|audit|bookkeep/i.test(svcLower + industry)

    if (isHR) {
      return `**${tc(targetKeyword)} in Vietnam** operates within a regulatory framework that differs substantially from many of its Southeast Asian neighbours — and getting the details right matters.

**Employment and statutory contributions**
Vietnam's Labor Code 2019 governs employment relationships, including requirements around written labour contracts, probation periods, notice periods, and termination procedures. The statutory contribution framework includes BHXH (social insurance — employer 17.5%), BHYT (health insurance — employer 3%), and BHTN (unemployment insurance — employer 1%). Trade union fees add a further 2% of the total payroll fund. For foreign workers, separate work permit requirements apply and must be managed proactively.

**FDI and EOR considerations**
For companies expanding into Vietnam without a local entity, the Employer of Record (EOR) model provides a compliant path to hiring local employees. This is increasingly common for regional businesses entering the Vietnamese market — particularly for sales and operations roles where speed of hiring matters.

**What this means for ${aud} in practice**
Vietnam's employment laws and contribution rates evolve regularly. Businesses managing Vietnam headcount without specialist local knowledge frequently encounter compliance gaps — often only discovered during an audit or due diligence review. ${co} operates specifically in this market and stays current on regulatory changes that affect ${aud} operating here.`
    }

    if (isFinance) {
      return `**${tc(targetKeyword)} in Vietnam** sits within a tax and compliance framework administered by the General Department of Taxation (GDT), with requirements that differ from neighbouring markets in important ways.

**Tax framework**
Standard rates include VAT at 10% (with reduced rates for certain sectors), Corporate Income Tax (CIT) at 20% for standard entities, and Withholding Tax (WHT) on payments to foreign entities. Transfer pricing rules and documentation requirements have become more rigorous in recent years, particularly for FDI businesses with related-party transactions.

**Practical compliance considerations**
Monthly VAT and provisional CIT payments require accurate books and timely filing. Foreign businesses operating in Vietnam — particularly those in the FDI sector — often underestimate the compliance overhead until a tax inspection highlights the gaps.

**What this means for ${aud}**
Vietnam's regulatory environment rewards businesses that build their compliance infrastructure early. ${co} supports ${aud} with the local knowledge and processes to stay compliant — without the overhead of maintaining a full in-house finance and tax team.`
    }

    return `Every market has its own dynamics — and **${targetKeyword}** looks different in Vietnam compared to Singapore, Malaysia, or markets outside the region.

Vietnam's regulatory environment for ${svc} is shaped by the Labor Code 2019, a structured statutory contribution framework (BHXH, BHYT, BHTN), and increasingly stringent tax compliance requirements administered by the General Department of Taxation (GDT). For businesses expanding into Vietnam, understanding these frameworks — rather than applying a regional template — is what separates compliant, effective operations from those that create problems later.

${co} works specifically with ${aud} operating in or expanding into Vietnam. That local focus means our advice and support reflects how things actually work in this market — not how they work somewhere else.`
  }

  if (isMalaysia) {
    const isHR = /hr|payroll|hiring|recruit|staffing|employee|workforce|eor|employer of record/i.test(svcLower + industry)
    const isFinance = /finance|accounting|tax|audit|bookkeep/i.test(svcLower + industry)

    if (isHR) {
      return `**${tc(targetKeyword)} in Malaysia** operates within a well-established employment law framework that has some important nuances — particularly around statutory contributions, worker classifications, and recent Employment Act amendments.

**Statutory contributions**
Malaysia's EPF (Employees Provident Fund) requires employer contributions of 13% for employees earning RM5,000 and below, and 12% for those earning above that threshold. Employee contributions are 11%. SOCSO (Social Security Organisation) covers work-related injury and disability. EIS (Employment Insurance System) provides income replacement during job loss — employer and employee rates are each 0.4%. PCB (Potongan Cukai Bulanan), Malaysia's monthly tax deduction at source, requires accurate monthly calculations based on LHDN schedules.

**HRD Corp levy**
Employers meeting the qualifying headcount threshold must contribute to HRD Corp. This levy funds the training grant framework that businesses can draw from — making it both an obligation and an opportunity for companies that understand how to access it.

**What this means for ${aud}**
Getting Malaysian payroll right requires current knowledge of EPF, SOCSO, EIS, PCB, and HRD Corp requirements — and the discipline to apply them consistently every cycle. ${co} manages this complexity for ${aud} so your team can focus on the business rather than the compliance infrastructure.`
    }

    if (isFinance) {
      return `**${tc(targetKeyword)} in Malaysia** operates within a tax framework administered by LHDN (Lembaga Hasil Dalam Negeri — Malaysia's Inland Revenue Board), with several compliance layers that growing businesses need to manage carefully.

**Tax framework**
Malaysia's Sales and Service Tax (SST) framework currently applies service tax at 6% on taxable services. Corporate income tax for SMEs qualifying for the reduced rate is 17% on the first RM600,000 of chargeable income; the standard rate is 24%. Annual filing, monthly PCB compliance, and transfer pricing documentation (where applicable) are ongoing requirements.

**SME support**
Malaysia's SME Corp and MDEC (Malaysia Digital Economy Corporation) provide grants and support for qualifying businesses investing in technology, capability development, and digital transformation. Understanding the grant landscape before committing your budget is a practical first step.

**What this means for ${aud}**
Malaysia's compliance framework is manageable with the right infrastructure. ${co} supports ${aud} with the local knowledge and processes to meet LHDN, SST, and statutory requirements — without the overhead of a full in-house finance team.`
    }

    return `Every market has its own dynamics — and **${targetKeyword}** looks meaningfully different in Malaysia compared to Singapore or other Southeast Asian markets.

Malaysia's framework for ${svc} is shaped by the Employment Act 1955 (and its recent amendments), a statutory contributions system covering EPF, SOCSO, and EIS, and a tax environment administered by LHDN. For businesses operating across the region, applying a Singapore-based playbook to Malaysian operations frequently creates compliance gaps — particularly around payroll calculations, PCB requirements, and HRD Corp levy obligations.

${co} operates specifically with ${aud} in Malaysia. Our support reflects how things actually work in the Malaysian market — the regulatory reality, not a generic regional approach.`
  }

  return `Every market has its own dynamics — and **${targetKeyword}** looks different depending on where your business operates.

In ${loc || 'your market'}, the key contextual factors for ${svc} include the local regulatory environment, market dynamics that shape how ${aud} make decisions, and the specific compliance obligations that apply to businesses operating here. A generic, globally-templated approach to ${svc} often misses these nuances — the result is a strategy or process that looks right on paper but doesn't account for how things actually work in context.

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

  if (/singapore|malaysia|vietnam|local market|in indonesia|region|southeast asia|sea/.test(h))
    return writeLocalContext(h2, brief, project, ctx)

  return writeDefaultSection(h2, brief, project, ctx)
}

function writeDefaultSection(h2, brief, project, ctx) {
  const { targetKeyword } = brief
  const { svc, aud, co, loc, isSG, country, industry, services, svcLower } = ctx
  const locPhrase = loc ? ` in ${loc}` : ''
  const sgLine    = isSG ? `\n\n${getLocalHook(ctx, 'market')}` : ''

  let challenge
  if (/recruitment|hiring|talent/i.test(services + industry)) {
    challenge = `finding candidates who genuinely fit the role and the team — not just the job description. Attraction is the easy part; retention and performance are where most recruitment investments succeed or fail`
  } else if (/payroll|salary/i.test(services + industry)) {
    challenge = `maintaining accuracy across a growing, changing workforce while staying current with statutory obligations. What works for 20 employees rarely scales cleanly to 60 — and the compliance exposure grows proportionally`
  } else if (/eor|employer of record/i.test(services + industry)) {
    challenge = `knowing where legal employment responsibilities sit in a cross-border arrangement. Misclassifying the relationship is the most common source of regulatory risk in cross-border hiring`
  } else if (/finance|accounting|tax/i.test(services + industry)) {
    challenge = `maintaining financial discipline at pace. Growing businesses frequently find that their financial infrastructure lags their operational reality — creating reporting gaps, compliance exposure, and decisions made on unreliable data`
  } else if (/saas|software|tech|digital/i.test(services + industry)) {
    challenge = `balancing feature delivery speed with operational reliability. The technical debt created by moving too fast compounds — and tends to surface at the worst possible time`
  } else {
    challenge = `distinguishing between operational activity and genuine progress. Being busy with ${svc} and improving ${svc} are not the same thing — the businesses that get this right measure outcomes, not effort`
  }

  return `When it comes to **${stripMarkup(h2)}** in the context of ${targetKeyword}, context determines almost everything.

What works well for one type of ${aud} may not translate directly to another. Size matters. Industry matters. Your team's current capabilities matter. And the specific constraints of your market${locPhrase} matter more than most generic guides acknowledge.

Here's what holds true across most situations: the ${aud} who get the most from ${targetKeyword} approach it with specific goals, realistic timelines, and a genuine willingness to iterate. They don't expect perfection from the first attempt — but they do track progress deliberately and adjust when the data tells them something isn't working.

For ${aud}${locPhrase}, the most important consideration around ${svc} at this stage is ${challenge}. Understanding this upfront shapes every decision that follows.${sgLine}

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

  if (isBOFU && isServicePage) {
    return `If **${targetKeyword}** is something your business needs to get right — and you're weighing up whether ${co} is the right partner — the most efficient next step is a short discovery call.

It's 30 minutes. We'll ask about your current situation, what you've tried before, and what success looks like for your business. You'll have the chance to ask us about our process, our experience, and what working together actually looks like.

No pressure, no commitment. If it's a genuine fit, we'll both know. If it's not, you'll leave with more clarity than you came in with — which has its own value.

**${ctaLabel}** — and let's see if there's a fit.`
  }

  if (isBOFU) {
    return `You've done the research. You have a sense of what **${targetKeyword}** involves and what a good outcome looks like. The remaining question is whether ${co} is the right partner for your specific situation.

The most efficient way to answer that is a direct conversation. Come with your hardest questions — we'd rather address them upfront than discover they're blockers three months in.

**${ctaLabel}** — and let's figure out together whether we're the right fit.`
  }

  if (isMOFU) {
    return `The research phase of **${targetKeyword}** gets you to a point — but at some stage, the most useful next step is a conversation with someone who's navigated this with businesses in your situation before.

If you'd like a no-obligation perspective on your specific context — not a sales pitch — ${co} is easy to reach. We'll tell you what we'd recommend, be honest about whether we're the right fit, and respect your time.

**${ctaLabel}** and tell us a bit about where you are. We'll tell you what we think.`
  }

  if (isTOFU && isB2B) {
    return `**${tc(targetKeyword)}** is one of those areas where the gap between a good approach and a poor one compounds over time. The businesses that get this right don't necessarily have more resources — they made better decisions earlier, and they built from there.

If this article surfaced questions specific to your situation — or if you'd like an honest second opinion on your current ${svc} setup — ${co} offers a free 30-minute review call. No pitch, no pressure. Just a focused conversation.

Most people leave with at least two or three concrete things they can act on immediately.

**${ctaLabel}** — or reach out directly if you have a specific question in mind.`
  }

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

  sections.push(`# ${suggestedH1}`)
  sections.push('')

  sections.push(writeIntro(brief, project, ctx))
  sections.push('')

  const bodyH2s = h2s.slice(0, -2)
  bodyH2s.forEach(h2 => {
    sections.push(`## ${h2}`)
    sections.push('')
    sections.push(writeSectionBody(h2, brief, project, ctx))
    sections.push('')
  })

  const faqH2 = h2s.find(h => /faq|question/i.test(h)) || 'Frequently Asked Questions'
  sections.push(`## ${faqH2}`)
  sections.push('')
  sections.push(writeFAQSection(faqs))
  sections.push('')

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
    focusKeyphrase:  brief.focusKeyphrase || targetKeyword,
    title:           suggestedH1,
    metaTitle:       meta?.title || suggestedH1,
    metaDescription: meta?.description || '',
    slug:            brief.slug || '',
    body,
    wordCount,
    createdAt:       new Date().toISOString(),
  }
}
