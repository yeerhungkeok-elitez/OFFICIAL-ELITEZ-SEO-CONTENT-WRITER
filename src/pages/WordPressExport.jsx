import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Code, Tag, Image, Linkedin, FileJson, Zap, CheckCircle, ChevronDown, ChevronUp, AlertCircle, AlertTriangle, Brain } from 'lucide-react'
import { useProject } from '../context/ProjectContext'
import { buildWordPressExport } from '../lib/exportLogic'
import Card, { CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import CopyButton from '../components/ui/CopyButton'
import Badge from '../components/ui/Badge'

function ExportSection({ title, icon: Icon, badge, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card padding={false} className="overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-100"
      >
        <div className="flex items-center gap-2.5">
          <Icon size={16} className="text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">{title}</span>
          {badge && <span className="px-2 py-0.5 bg-brand-100 text-brand-700 text-xs rounded-full font-medium">{badge}</span>}
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && <div className="p-5">{children}</div>}
    </Card>
  )
}

function CodeBlock({ code, lang = 'html', copyLabel = 'Copy' }) {
  return (
    <div className="relative">
      <div className="flex items-center justify-between bg-slate-800 px-4 py-2 rounded-t-lg">
        <span className="text-slate-400 text-xs font-mono">{lang}</span>
        <CopyButton text={code} label={copyLabel} size="xs" />
      </div>
      <pre className="bg-slate-900 rounded-b-lg p-4 overflow-x-auto text-xs text-slate-300 font-mono max-h-72 whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  )
}

function MetaRow({ label, value, charLimit }) {
  const over = charLimit && value?.length > charLimit
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
        {value?.length > 0 && (
          <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${over ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
            {value.length}{charLimit ? `/${charLimit}` : ''} chars
          </span>
        )}
        <CopyButton text={value} size="xs" />
      </div>
      <div className={`text-sm px-3 py-2 rounded-lg border ${over ? 'border-red-200 bg-red-50 text-red-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
        {value || <span className="text-slate-400 italic">Not set</span>}
      </div>
      {over && <p className="text-xs text-red-600">⚠ Over limit by {value.length - charLimit} characters — shorten this.</p>}
    </div>
  )
}

export default function WordPressExport() {
  const { activeProject } = useProject()
  const navigate = useNavigate()
  const [building, setBuilding]   = useState(false)
  const [exportData, setExportData] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  const contents = activeProject?.generatedContent || []
  const briefs   = activeProject?.briefs || []
  const scores   = activeProject?.scores || []

  const selectedContent = contents.find(c => c.id === selectedId) || contents[0] || null
  const relatedBrief    = briefs.find(b => b.id === selectedContent?.briefId) || null
  const relatedScore    = scores.find(s => s.contentId === selectedContent?.id) || null

  function handleBuild() {
    if (!selectedContent) return
    setBuilding(true)
    setTimeout(() => {
      const exp = buildWordPressExport(selectedContent, relatedBrief, activeProject, relatedScore)
      setExportData(exp)
      setBuilding(false)
    }, 600)
  }

  function downloadHTML() {
    if (!exportData) return
    const blob = new Blob([exportData.fullExport], { type: 'text/html' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${exportData.slug || 'article'}-wordpress.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Download size={40} className="text-slate-300 mx-auto mb-3" />
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
            <span className="w-5 h-5 bg-brand-100 text-brand-700 rounded text-xs font-bold flex items-center justify-center">6</span>
            Step 6 of 6
          </div>
          <h1 className="text-2xl font-bold text-slate-900">WordPress Export</h1>
          <p className="text-slate-500 text-sm mt-1">
            Clean HTML, meta tags, FAQ schema JSON-LD, image alt text, and a LinkedIn caption.
          </p>
        </div>
      </div>

      {contents.length === 0 && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-amber-800 font-medium text-sm mb-1">No content to export</p>
          <p className="text-amber-700 text-sm mb-3">Write an article first before exporting.</p>
          <Button size="sm" variant="secondary" onClick={() => navigate('/writer')}>Go to SEO Writer</Button>
        </div>
      )}

      {contents.length > 0 && (
        <>
          {/* Select content */}
          <Card>
            <CardHeader title="Select Article to Export" icon={Download} />
            <div className="flex flex-wrap gap-2 mb-4">
              {contents.map(c => {
                const score = scores.find(s => s.contentId === c.id)
                return (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedId(c.id); setExportData(null) }}
                    className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all capitalize
                      ${selectedContent?.id === c.id
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    {c.targetKeyword?.slice(0, 30) || 'Article'}
                    {score && (
                      <span className={`ml-2 text-xs font-bold ${score.overall >= 70 ? 'text-green-400' : 'text-amber-400'}`}>
                        {score.overall}%
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {selectedContent && (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-sm font-semibold text-slate-700 capitalize">{selectedContent.targetKeyword}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">{selectedContent.wordCount} words</span>
                    {relatedScore && (
                      <Badge label={`Score: ${relatedScore.overall}/100`} color={relatedScore.overall >= 70 ? 'green' : 'amber'} size="xs" />
                    )}
                    {!relatedScore && (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertCircle size={12} /> Not scored yet
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!relatedScore && (
                    <Button size="sm" variant="secondary" onClick={() => navigate('/score')}>
                      Score First
                    </Button>
                  )}
                  <Button onClick={handleBuild} loading={building} icon={Zap} size="sm">
                    {exportData ? 'Rebuild Export' : 'Build Export Package'}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Export package */}
          {building && (
            <Card className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Building export package…</p>
            </Card>
          )}

          {exportData && !building && (
            <>
              {/* Placeholder warning */}
              {exportData.hasPlaceholders && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-semibold text-sm">
                      ⚠ {exportData.placeholderCount} unresolved placeholder{exportData.placeholderCount > 1 ? 's' : ''} detected
                    </p>
                    <p className="text-red-700 text-xs mt-0.5">
                      The content contains bracketed placeholder text (e.g. [add specific detail]). Do not publish until all placeholders are replaced with real content. Go to the SEO Writer to edit.
                    </p>
                  </div>
                </div>
              )}

              {/* Success bar */}
              <div className={`flex items-center justify-between p-4 rounded-xl border ${exportData.hasPlaceholders ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                <div className="flex items-center gap-2.5">
                  {exportData.hasPlaceholders
                    ? <AlertCircle size={20} className="text-amber-500" />
                    : <CheckCircle size={20} className="text-green-600" />
                  }
                  <div>
                    <p className={`font-semibold text-sm ${exportData.hasPlaceholders ? 'text-amber-800' : 'text-green-800'}`}>
                      {exportData.hasPlaceholders ? 'Export ready — review before publishing' : 'Export ready!'}
                    </p>
                    <p className={`text-xs ${exportData.hasPlaceholders ? 'text-amber-700' : 'text-green-700'}`}>
                      All assets generated. Copy what you need or download the full HTML file.
                      {exportData.brandBrainApplied && ' · Brand Brain context applied.'}
                    </p>
                  </div>
                </div>
                <Button onClick={downloadHTML} icon={Download} variant="secondary" size="sm">
                  Download HTML
                </Button>
              </div>

              {/* Brand Brain status */}
              {exportData.brandBrainApplied && (
                <div className="flex items-center gap-2 p-3 bg-brand-50 border border-brand-200 rounded-xl">
                  <Brain size={15} className="text-brand-500 flex-shrink-0" />
                  <span className="text-xs text-brand-700 font-medium">Brand Brain context was applied when this content was generated.</span>
                </div>
              )}

              {/* Meta Tags */}
              <ExportSection title="Meta Tags" icon={Tag} badge="WordPress / Yoast / RankMath">
                <div className="space-y-4">
                  <MetaRow label="Meta Title" value={exportData.metaTitle} charLimit={60} />
                  <MetaRow label="Meta Description" value={exportData.metaDescription} charLimit={160} />
                  {exportData.focusKeyphrase && (
                    <MetaRow label="Focus Keyphrase (Yoast / RankMath)" value={exportData.focusKeyphrase} />
                  )}
                  <MetaRow label="URL Slug" value={exportData.slug} />
                </div>
                <p className="text-xs text-slate-500 mt-4">
                  📌 In WordPress: Paste meta title and description into Yoast SEO or RankMath. Set the slug in the URL field. Enter the focus keyphrase in Yoast's "Focus keyphrase" field.
                </p>
              </ExportSection>

              {/* HTML Body */}
              <ExportSection title="HTML Content (WordPress Body)" icon={Code} badge="Paste into Gutenberg HTML block">
                <p className="text-xs text-slate-500 mb-3">
                  Paste this into the WordPress "Custom HTML" block or use the Classic Editor's HTML view.
                </p>
                <CodeBlock code={exportData.htmlBody} lang="html" copyLabel="Copy HTML" />
              </ExportSection>

              {/* FAQ Schema */}
              <ExportSection title="FAQ Schema (JSON-LD)" icon={FileJson} badge="Paste in page head" defaultOpen={false}>
                <p className="text-xs text-slate-500 mb-3">
                  📌 Paste this JSON-LD into the {"<head>"} of your page, or use the Yoast FAQ block / RankMath Schema module. This enables FAQ rich results in Google.
                </p>
                <CodeBlock code={exportData.faqSchemaJSON} lang="json" copyLabel="Copy FAQ Schema" />
              </ExportSection>

              {/* Article Schema */}
              <ExportSection title="Article Schema (JSON-LD)" icon={FileJson} badge="Optional" defaultOpen={false}>
                <p className="text-xs text-slate-500 mb-3">
                  Optional but recommended for blog articles. Paste in {"<head>"} alongside the FAQ schema.
                </p>
                <CodeBlock code={exportData.articleSchemaJSON} lang="json" copyLabel="Copy Article Schema" />
              </ExportSection>

              {/* Image Alt Text */}
              <ExportSection title="Image Alt Text Suggestions" icon={Image} defaultOpen={false}>
                <p className="text-xs text-slate-500 mb-3">
                  Use these as starting points. Customise based on your actual images.
                </p>
                <div className="space-y-2">
                  {exportData.imageAlts?.map((img, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-600">{img.position}</p>
                        <p className="text-sm text-slate-700 mt-0.5">{img.alt}</p>
                      </div>
                      <CopyButton text={img.alt} size="xs" />
                    </div>
                  ))}
                </div>
              </ExportSection>

              {/* LinkedIn Caption */}
              <ExportSection title="LinkedIn Caption" icon={Linkedin} badge="Social promotion" defaultOpen={false}>
                <p className="text-xs text-slate-500 mb-3">
                  Post this to LinkedIn when your article goes live to drive early traffic and engagement.
                </p>
                <div className="relative p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono text-xs">
                  {exportData.linkedInCaption}
                </div>
                <div className="mt-3">
                  <CopyButton text={exportData.linkedInCaption} label="Copy LinkedIn Caption" />
                </div>
              </ExportSection>

              {/* Publishing checklist */}
              <Card className="bg-slate-900 text-slate-200">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-brand-400" />
                  Publishing Checklist
                </h3>
                <ul className="space-y-2 text-sm">
                  {[
                    'Paste meta title and description into Yoast SEO / RankMath',
                    'Set the URL slug before publishing',
                    'Paste HTML content into a Custom HTML block',
                    'Paste FAQ schema JSON-LD into the page head',
                    'Add 3–5 images with the suggested alt text',
                    'Add at least 2–3 internal links to related pages',
                    'Set a featured image with keyword-rich alt text',
                    'Preview on mobile before publishing',
                    'Submit URL to Google Search Console after publishing',
                    'Share the LinkedIn caption when the page goes live',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full border-2 border-slate-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}
