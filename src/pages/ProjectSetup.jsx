import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, ChevronRight, Save, AlertCircle } from 'lucide-react'
import { useProject } from '../context/ProjectContext'
import { INDUSTRIES, COUNTRIES, TONES } from '../lib/seoLogic'
import Card, { CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'

function Field({ label, hint, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400
        focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400
        focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition resize-y"
    />
  )
}

function Select({ value, onChange, options, placeholder = 'Select...' }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900
        focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
    >
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  )
}

export default function ProjectSetup() {
  const { activeProject, createProject, updateActiveProject } = useProject()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    companyName: '',
    website: '',
    country: '',
    industry: '',
    services: '',
    targetAudience: '',
    tone: 'Professional & Authoritative',
  })

  useEffect(() => {
    if (activeProject) {
      setForm({
        companyName:    activeProject.companyName    || '',
        website:        activeProject.website        || '',
        country:        activeProject.country        || '',
        industry:       activeProject.industry       || '',
        services:       activeProject.services       || '',
        targetAudience: activeProject.targetAudience || '',
        tone:           activeProject.tone           || 'Professional & Authoritative',
      })
    }
  }, [activeProject?.id])

  function set(field) {
    return val => setForm(f => ({ ...f, [field]: val }))
  }

  function handleSave() {
    if (!form.companyName.trim()) return
    if (activeProject) {
      updateActiveProject(form)
    } else {
      createProject(form)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const isValid = form.companyName.trim() && form.industry && form.country && form.services.trim()

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <span className="w-5 h-5 bg-brand-100 text-brand-700 rounded text-xs font-bold flex items-center justify-center">1</span>
            Step 1 of 6
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Project Setup</h1>
          <p className="text-slate-500 text-sm mt-1">
            This context powers every keyword, brief, and article the engine creates. Be specific — the more detail you add, the better the output.
          </p>
        </div>
      </div>

      {/* Company Info */}
      <Card>
        <CardHeader title="Company Information" icon={Settings} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Company Name" required>
            <Input value={form.companyName} onChange={set('companyName')} placeholder="e.g. Acme HR Solutions" />
          </Field>
          <Field label="Website URL" hint="Used in export and schema markup">
            <Input value={form.website} onChange={set('website')} placeholder="https://yourwebsite.com" type="url" />
          </Field>
          <Field label="Country / Market" required>
            <Select value={form.country} onChange={set('country')} options={COUNTRIES} placeholder="Select country..." />
          </Field>
          <Field label="Industry" required>
            <Select value={form.industry} onChange={set('industry')} options={INDUSTRIES} placeholder="Select industry..." />
          </Field>
        </div>
      </Card>

      {/* Services & Audience */}
      <Card>
        <CardHeader title="Services & Audience" subtitle="The foundation of your keyword and content strategy" />
        <div className="space-y-4">
          <Field
            label="Services / Products"
            required
            hint="Separate multiple services with commas. Example: HR software, payroll automation, employee onboarding"
          >
            <Textarea
              value={form.services}
              onChange={set('services')}
              placeholder="e.g. HR software, payroll automation, leave management, employee performance tracking"
              rows={2}
            />
          </Field>
          <Field
            label="Target Audience"
            required
            hint="Separate multiple audiences with commas. Example: SMEs, HR managers, operations directors"
          >
            <Textarea
              value={form.targetAudience}
              onChange={set('targetAudience')}
              placeholder="e.g. SMEs in Malaysia, HR managers, operations directors, growing startups"
              rows={2}
            />
          </Field>
        </div>
      </Card>

      {/* Tone */}
      <Card>
        <CardHeader title="Content Tone" subtitle="How your content should sound to your audience" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TONES.map(tone => (
            <button
              key={tone}
              onClick={() => set('tone')(tone)}
              className={`p-3 rounded-xl border text-left text-sm font-medium transition-all
                ${form.tone === tone
                  ? 'bg-brand-50 border-brand-400 text-brand-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </Card>

      {/* Validation notice */}
      {!isValid && (
        <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-amber-600" />
          Fill in Company Name, Country, Industry, and Services to continue.
        </div>
      )}

      {/* Save & Continue */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={!isValid}
          icon={saved ? undefined : Save}
          className={saved ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {saved ? '✓ Saved!' : 'Save Project'}
        </Button>
        {saved && (
          <Button
            variant="outline"
            onClick={() => navigate('/keywords')}
            iconRight={ChevronRight}
          >
            Next: Keyword Research
          </Button>
        )}
      </div>
    </div>
  )
}
