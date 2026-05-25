import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Zap, ChevronRight, ChevronDown, ChevronUp, ExternalLink, Link2, Tag } from 'lucide-react'
import { useProject } from '../context/ProjectContext'
import { generateBrief } from '../lib/briefLogic'
import Card, { CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import CopyButton from '../components/ui/CopyButton'
import Badge, { IntentBadge, FunnelBadge } from '../components/ui/Badge'

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-700">{title}</span>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && <div className="px-4 py-4">{children}</div>}
    </div>
  )
}

function BriefCard({ brief, project }) {
  if (!brief) return null
  return (
    <div className="space-y-3">
      {/* Meta */}
      <div className="flex flex-wrap gap-2 mb-2">
        <IntentBadge intent={brief.intent} />
        <FunnelBadge funnel={brief.funnel} />
        <Badge label={brief.pageType} color="purple" />
        <Badge label={brief.wordCountTarget} color="slate" />
      </div>

      {/* H1 */}
      <Section title="Suggested H1" defaultOpen={true}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-slate-900 font-semibold text-base leading-snug">{brief.suggestedH1}</p>
          <CopyButton text={brief.suggestedH1} size="xs" />
        </div>
      </Section>

      {/* H2s */}
      <Section title={`Suggested H2 Structure (${brief.h2s?.length || 0} sections)`} defaultOpen={true}>
        <ol className="space-y-2">
          {brief.h2s?.map((h2, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="w-5 h-5 bg-brand-100 text-brand-700 rounded text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <span className="text-slate-700 text-sm">{h2}</span>
            </li>
          ))}
        </ol>
        <div className="mt-3">
          <CopyButton text={brief.h2s?.map((h, i) => `H2 ${i + 1}: ${h}`).join('\n')} label="Copy All H2s" />
        </div>
      </Section>

      {/* FAQs */}
      <Section title={`FAQs (${brief.faqs?.length || 0} questions)`} defaultOpen={false}>
        <div className="space-y-3">
          {brief.faqs?.map((faq, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-sm font-semibold text-slate-800 mb-1">Q: {faq.q}</p>
              <p className="text-xs text-slate-600 leading-relaxed">A: {faq.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <CopyButton text={brief.faqs?.map(f => `Q: ${f.q}\nA: ${f.a}`).join('\n\n')} label="Copy FAQs" />
        </div>
      </Section>

      {/* Meta */}
      <Section title="Meta Tags" defaultOpen={true}>
        <div className="space-y-3">
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Meta Title ({brief.meta?.title?.length || 0} chars)</div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-800 flex-1 font-medium">{brief.meta?.title}</p>
              <CopyButton text={brief.meta?.title} size="xs" />
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Meta Description ({brief.meta?.description?.length || 0} chars)</div>
            <div className="flex items-start gap-2">
              <p className="text-sm text-slate-700 flex-1 leading-relaxed">{brief.meta?.description}</p>
              <CopyButton text={brief.meta?.description} size="xs" />
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Slug</div>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-700">/blog/{brief.slug}</code>
              <CopyButton text={`/blog/${brief.slug}`} size="xs" />
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section title="Call to Action" defaultOpen={false}>
        <div className="p-3 bg-brand-50 border border-brand-100 rounded-lg space-y-2">
          <p className="text-sm font-semibold text-brand-900">{brief.cta?.heading}</p>
          <p className="text-sm text-brand-700 leading-relaxed">{brief.cta?.body}</p>
          <div className="flex items-center gap-2 pt-1">
            <span className="inline-block bg-brand-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg">{brief.cta?.buttonLabel}</span>
            <CopyButton text={`${brief.cta?.heading}\n\n${brief.cta?.body}\n\n[${brief.cta?.buttonLabel}]`} size="xs" />
          </div>
        </div>
      </Section>

      {/* Internal Links */}
      <Section title={`Internal Link Suggestions (${brief.internalLinks?.length || 0})`} defaultOpen={false}>
        <div className="space-y-2">
          {brief.internalLinks?.map((link, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <Link2 size={14} className="text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-brand-600">{link.anchorText}</span>
                <span className="text-slate-400 text-xs ml-2">→ {link.suggestedURL}</span>
              </div>
              <Badge label={link.relevance} color={link.relevance === 'High' ? 'green' : link.relevance === 'Medium' ? 'amber' : 'slate'} size="xs" />
            </div>
          ))}
        </div>
      </Section>

      {/* LSI */}
      <Section title="LSI / Related Keywords" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {brief.lsiKeywords?.map((kw, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full border border-slate-200">
              <Tag size={11} /> {kw}
            </span>
          ))}
        </div>
      </Section>

      {/* Readability target */}
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
        <strong className="text-slate-700">Readability target:</strong> {brief.readabilityTarget}
      </div>
    </div>
  )
}

export default function ContentBriefGenerator() {
  const { activeProject, saveBrief, saveKeywords } = useProject()
  const navigate = useNavigate()
  const [generating, setGenerating] = useState(false)
  const [activeBriefId, setActiveBriefId] = useState(null)

  const selectedKeywords = (activeProject?.keywords || []).filter(k => k.selected)
  const briefs = activeProject?.briefs || []
  const activeBrief = briefs.find(b => b.id === activeBriefId) || briefs[0] || null

  function handleGenerate() {
    if (!activeProject || !selectedKeywords.length) return
    setGenerating(true)
    setTimeout(() => {
      const newBriefs = selectedKeywords.map(kw => generateBrief(kw, activeProject))
      newBriefs.forEach(brief => {
        saveBrief(brief)
        // Mark keyword as having a brief
        const updated = (activeProject.keywords || []).map(k =>
          k.id === brief.keywordId ? { ...k, hasBrief: true } : k
        )
        saveKeywords(updated)
      })
      setActiveBriefId(newBriefs[0]?.id || null)
      setGenerating(false)
    }, 1000)
  }

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No project found</p>
          <Button onClick={() => navigate('/project')}>Go to Project Setup</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <span className="w-5 h-5 bg-brand-100 text-brand-700 rounded text-xs font-bold flex items-center justify-center">3</span>
            Step 3 of 6
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Content Brief Generator</h1>
          <p className="text-slate-500 text-sm mt-1">
            Generates a complete brief: H1, H2 structure, FAQs, meta tags, CTA, and internal link suggestions.
          </p>
        </div>
      </div>

      {/* No keywords selected */}
      {selectedKeywords.length === 0 && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-amber-800 font-medium text-sm mb-1">No keywords selected</p>
          <p className="text-amber-700 text-sm mb-3">Go back to Keyword Research and select at least one keyword to build a brief.</p>
          <Button size="sm" variant="secondary" onClick={() => navigate('/keywords')}>
            Go to Keywords
          </Button>
        </div>
      )}

      {selectedKeywords.length > 0 && (
        <>
          {/* Generate button + selected keywords */}
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  {selectedKeywords.length} keyword{selectedKeywords.length > 1 ? 's' : ''} selected
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedKeywords.map(kw => (
                    <span key={kw.id} className="inline-block px-2.5 py-1 bg-brand-50 text-brand-700 text-xs rounded-full border border-brand-200 capitalize">
                      {kw.keyword}
                    </span>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleGenerate}
                loading={generating}
                icon={Zap}
                disabled={generating}
              >
                {briefs.length > 0 ? 'Regenerate Briefs' : 'Generate Briefs'}
              </Button>
            </div>
          </Card>

          {/* Brief tabs + content */}
          {briefs.length > 0 && (
            <>
              {/* Tabs */}
              {briefs.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {briefs.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setActiveBriefId(b.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border capitalize
                        ${(activeBrief?.id === b.id)
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      {b.targetKeyword.length > 30 ? b.targetKeyword.slice(0, 30) + '…' : b.targetKeyword}
                    </button>
                  ))}
                </div>
              )}

              <Card>
                <CardHeader
                  title={activeBrief?.targetKeyword}
                  subtitle={`${activeBrief?.pageType} · ${activeBrief?.funnel}`}
                  icon={FileText}
                  action={
                    <Button size="sm" onClick={() => navigate('/writer')} iconRight={ChevronRight}>
                      Write Content
                    </Button>
                  }
                />
                <BriefCard brief={activeBrief} project={activeProject} />
              </Card>

              <div className="flex items-center gap-3">
                <Button variant="primary" onClick={() => navigate('/writer')} iconRight={ChevronRight}>
                  Next: Write SEO Content
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
