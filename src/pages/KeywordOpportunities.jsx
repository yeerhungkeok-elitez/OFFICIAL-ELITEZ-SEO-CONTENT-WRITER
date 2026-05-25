import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, RefreshCw, ChevronRight, Filter, ArrowUpDown, FileText, AlertCircle } from 'lucide-react'
import { useProject } from '../context/ProjectContext'
import { generateKeywords } from '../lib/seoLogic'
import Card, { CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge, { IntentBadge, FunnelBadge, DifficultyBadge } from '../components/ui/Badge'

const PAGE_TYPE_COLORS = {
  'Blog Article':    'blue',
  'Ultimate Guide':  'purple',
  'Service Page':    'green',
  'Landing Page':    'brand',
  'Comparison Page': 'amber',
  'FAQ Page':        'slate',
}

export default function KeywordOpportunities() {
  const { activeProject, saveKeywords } = useProject()
  const navigate = useNavigate()

  const [generating, setGenerating] = useState(false)
  const [filter, setFilter]         = useState('All')
  const [sort, setSort]             = useState('priority')

  const keywords = activeProject?.keywords || []
  const selectedCount = keywords.filter(k => k.selected).length

  function handleGenerate() {
    if (!activeProject) return
    setGenerating(true)
    setTimeout(() => {
      const kws = generateKeywords(activeProject)
      saveKeywords(kws)
      setGenerating(false)
    }, 800)
  }

  function toggleSelect(id) {
    const updated = keywords.map(k => k.id === id ? { ...k, selected: !k.selected } : k)
    saveKeywords(updated)
  }

  function selectAll() {
    saveKeywords(keywords.map(k => ({ ...k, selected: true })))
  }
  function selectNone() {
    saveKeywords(keywords.map(k => ({ ...k, selected: false })))
  }

  const filtered = useMemo(() => {
    let kws = filter === 'All' ? keywords : keywords.filter(k => k.funnel === filter || k.intent === filter)
    if (sort === 'priority')   return [...kws].sort((a, b) => b.priority - a.priority)
    if (sort === 'difficulty') return [...kws].sort((a, b) => a.difficulty.value - b.difficulty.value)
    if (sort === 'value')      return [...kws].sort((a, b) => b.businessValue - a.businessValue)
    return kws
  }, [keywords, filter, sort])

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Search size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No project found</p>
          <p className="text-slate-400 text-sm mb-4">Set up your project first to generate keywords.</p>
          <Button onClick={() => navigate('/project')} icon={ChevronRight}>Go to Project Setup</Button>
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
            <span className="w-5 h-5 bg-brand-100 text-brand-700 rounded text-xs font-bold flex items-center justify-center">2</span>
            Step 2 of 6
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Keyword Opportunities</h1>
          <p className="text-slate-500 text-sm mt-1">
            AI-generated keyword clusters based on your services, audience, and market. Select the ones you want to create content for.
          </p>
        </div>
        <Button onClick={handleGenerate} loading={generating} icon={RefreshCw} variant={keywords.length ? 'secondary' : 'primary'}>
          {keywords.length ? 'Regenerate' : 'Generate Keywords'}
        </Button>
      </div>

      {/* No keywords yet */}
      {!keywords.length && !generating && (
        <Card className="text-center py-12">
          <Search size={44} className="text-slate-200 mx-auto mb-3" />
          <h3 className="text-slate-700 font-semibold mb-1">No keywords yet</h3>
          <p className="text-slate-500 text-sm mb-4">
            Click "Generate Keywords" to create a keyword opportunity list based on your{' '}
            <strong>{activeProject.services || 'services'}</strong>.
          </p>
          <Button onClick={handleGenerate} loading={generating} icon={Search}>
            Generate Keyword Opportunities
          </Button>
        </Card>
      )}

      {/* Keywords Table */}
      {keywords.length > 0 && (
        <>
          {/* Controls */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-400" />
              {['All', 'TOFU', 'MOFU', 'BOFU', 'Informational', 'Commercial', 'Transactional'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all
                    ${filter === f ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown size={14} className="text-slate-400" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600"
              >
                <option value="priority">Sort: Priority</option>
                <option value="value">Sort: Business Value</option>
                <option value="difficulty">Sort: Easiest First</option>
              </select>
            </div>
          </div>

          {/* Selection bar */}
          {selectedCount > 0 && (
            <div className="flex items-center justify-between p-3 bg-brand-50 border border-brand-200 rounded-xl">
              <span className="text-sm text-brand-700 font-medium">
                {selectedCount} keyword{selectedCount > 1 ? 's' : ''} selected
              </span>
              <Button size="sm" onClick={() => navigate('/brief')} iconRight={ChevronRight}>
                Create Brief for Selected
              </Button>
            </div>
          )}

          <Card padding={false}>
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="w-8 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedCount === keywords.length}
                        onChange={e => e.target.checked ? selectAll() : selectNone()}
                        className="rounded border-slate-300 text-brand-600"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Keyword</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Intent</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Funnel</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Difficulty</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Biz Value</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Page Type</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(kw => (
                    <tr
                      key={kw.id}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer
                        ${kw.selected ? 'bg-brand-50/50' : ''}`}
                      onClick={() => toggleSelect(kw.id)}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={kw.selected}
                          onChange={() => toggleSelect(kw.id)}
                          onClick={e => e.stopPropagation()}
                          className="rounded border-slate-300 text-brand-600"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 max-w-xs">
                        <span className="capitalize">{kw.keyword}</span>
                        {kw.hasBrief && <Badge label="Has Brief" color="brand" size="xs" className="ml-2" />}
                      </td>
                      <td className="px-4 py-3"><IntentBadge intent={kw.intent} /></td>
                      <td className="px-4 py-3"><FunnelBadge funnel={kw.funnel} /></td>
                      <td className="px-4 py-3"><DifficultyBadge difficulty={kw.difficulty} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-500 rounded-full"
                              style={{ width: `${kw.businessValue * 10}%` }}
                            />
                          </div>
                          <span className="text-slate-600 text-xs">{kw.businessValue}/10</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge label={kw.pageType} color={PAGE_TYPE_COLORS[kw.pageType] || 'slate'} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold text-sm ${kw.priority >= 70 ? 'text-green-600' : kw.priority >= 50 ? 'text-amber-600' : 'text-slate-500'}`}>
                          {kw.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex items-center gap-3">
            <Button
              variant={selectedCount > 0 ? 'primary' : 'secondary'}
              onClick={() => navigate('/brief')}
              iconRight={ChevronRight}
              disabled={selectedCount === 0}
            >
              {selectedCount > 0
                ? `Create Briefs for ${selectedCount} Keyword${selectedCount > 1 ? 's' : ''}`
                : 'Select keywords first'}
            </Button>
            {selectedCount === 0 && (
              <span className="text-sm text-slate-500 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-amber-500" />
                Click rows to select keywords
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
