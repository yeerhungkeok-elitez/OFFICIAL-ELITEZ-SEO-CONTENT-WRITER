import { useNavigate } from 'react-router-dom'
import {
  Settings, Search, FileText, PenLine,
  BarChart2, Download, ArrowRight, Zap,
  Globe, Users, Tag, TrendingUp, AlertCircle
} from 'lucide-react'
import { useProject } from '../context/ProjectContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const STEPS = [
  { to: '/project', icon: Settings,   step: '1', label: 'Project Setup',    desc: 'Add your company, industry, services, and audience.' },
  { to: '/keywords',icon: Search,     step: '2', label: 'Keyword Research', desc: 'Generate and score keyword opportunities for your business.' },
  { to: '/brief',   icon: FileText,   step: '3', label: 'Content Brief',    desc: 'Build a full brief: H1, H2s, FAQs, meta, and CTA.' },
  { to: '/writer',  icon: PenLine,    step: '4', label: 'SEO Writer',       desc: 'Generate helpful, business-relevant SEO articles.' },
  { to: '/score',   icon: BarChart2,  step: '5', label: 'Score Checker',    desc: 'Check SEO readiness, helpfulness, and conversion score.' },
  { to: '/export',  icon: Download,   step: '6', label: 'WordPress Export', desc: 'Export clean HTML, schema markup, and LinkedIn captions.' },
]

function StatPill({ icon: Icon, label, value, color = 'brand' }) {
  const colors = {
    brand:  'text-brand-600 bg-brand-50 border-brand-100',
    blue:   'text-blue-600 bg-blue-50 border-blue-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    amber:  'text-amber-600 bg-amber-50 border-amber-100',
  }
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${colors[color]}`}>
      <Icon size={18} />
      <div>
        <div className="text-xl font-bold leading-none">{value}</div>
        <div className="text-xs opacity-75 mt-0.5">{label}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { activeProject, projects, createProject } = useProject()
  const navigate = useNavigate()

  const keywordCount = activeProject?.keywords?.length || 0
  const briefCount   = activeProject?.briefs?.length || 0
  const contentCount = activeProject?.generatedContent?.length || 0
  const scoreCount   = activeProject?.scores?.length || 0

  const latestScore = activeProject?.scores?.slice(-1)[0]?.overall || null

  function handleStart() {
    if (!activeProject) {
      createProject({ companyName: 'My Company' })
    }
    navigate('/project')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-7 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(34,197,94,0.15),transparent_60%)]" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-brand-400" />
            <span className="text-brand-400 text-sm font-semibold">AI-Powered SEO Engine</span>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-balance">
            Build content that ranks — and actually helps people.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl mb-6">
            This tool follows people-first SEO principles. Not a mass article generator.
            Every piece is grounded in your business context, real keyword intent, and genuine helpfulness.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={handleStart} variant="primary" icon={Settings}>
              {activeProject ? 'Open Project Setup' : 'Start Your First Project'}
            </Button>
            {activeProject && (
              <Button onClick={() => navigate('/keywords')} variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">
                Jump to Keywords <ArrowRight size={14} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* No project notice */}
      {!activeProject && projects.length === 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-amber-800 font-medium text-sm">No project yet</div>
            <div className="text-amber-700 text-sm">Click "Start Your First Project" above to set up your company profile. All your work saves automatically.</div>
          </div>
        </div>
      )}

      {/* Active Project Stats */}
      {activeProject && (
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-900">{activeProject.companyName || 'Active Project'}</h2>
              <p className="text-slate-500 text-sm mt-0.5">
                {activeProject.industry || 'No industry set'} • {activeProject.country || 'No country set'}
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => navigate('/project')} icon={Settings}>
              Edit
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatPill icon={Search}   label="Keywords"   value={keywordCount} color="blue" />
            <StatPill icon={FileText} label="Briefs"     value={briefCount}   color="purple" />
            <StatPill icon={PenLine}  label="Articles"   value={contentCount} color="brand" />
            <StatPill
              icon={BarChart2}
              label="Best Score"
              value={latestScore !== null ? `${latestScore}%` : '—'}
              color="amber"
            />
          </div>

          {activeProject.services && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
              {activeProject.services.split(',').map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full border border-slate-200">
                  <Tag size={11} /> {s.trim()}
                </span>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Workflow Steps */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <TrendingUp size={18} className="text-brand-600" />
          6-Step SEO Content Workflow
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STEPS.map(({ to, icon: Icon, step, label, desc }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="group text-left p-4 bg-white rounded-xl border border-slate-200 hover:border-brand-300 hover:shadow-md hover:shadow-brand-50 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-brand-50 border border-slate-200 group-hover:border-brand-200 flex items-center justify-center flex-shrink-0 transition-all">
                  <span className="text-xs font-bold text-slate-500 group-hover:text-brand-600">{step}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Icon size={14} className="text-slate-400 group-hover:text-brand-500 transition-colors flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-800 group-hover:text-brand-700 transition-colors">{label}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Principles */}
      <Card className="bg-gradient-to-r from-brand-50 to-emerald-50 border-brand-100">
        <h3 className="font-semibold text-brand-900 mb-3 text-sm">🎯 People-First SEO Principles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-brand-800">
          <div className="flex items-start gap-2">
            <Users size={14} className="text-brand-600 mt-0.5 flex-shrink-0" />
            <div><strong>Human-first.</strong> Every article should genuinely help the reader — not just rank for a keyword.</div>
          </div>
          <div className="flex items-start gap-2">
            <Globe size={14} className="text-brand-600 mt-0.5 flex-shrink-0" />
            <div><strong>Business-specific.</strong> Generic content loses. Specific, context-rich content wins.</div>
          </div>
          <div className="flex items-start gap-2">
            <TrendingUp size={14} className="text-brand-600 mt-0.5 flex-shrink-0" />
            <div><strong>Intent-matched.</strong> Every page targets the right search intent at the right funnel stage.</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
