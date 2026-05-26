import { useState, useEffect } from 'react'
import { Brain, Save, Trash2, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { loadBrandBrain, saveBrandBrain, clearBrandBrain, DEFAULT_BRAND_BRAIN } from '../lib/brandBrain'
import Card, { CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'

function Field({ label, hint, name, value, onChange, multiline = false, placeholder = '' }) {
  return (
    <div className="space-y-1.5">
      <div>
        <label className="block text-sm font-semibold text-slate-700">{label}</label>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent placeholder:text-slate-300 resize-none"
        />
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent placeholder:text-slate-300"
        />
      )}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <div className="pt-2 pb-1 border-b border-slate-100">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{children}</h3>
    </div>
  )
}

export default function BrandBrain() {
  const [data, setData]       = useState({ ...DEFAULT_BRAND_BRAIN })
  const [saved, setSaved]     = useState(false)
  const [cleared, setCleared] = useState(false)

  useEffect(() => {
    setData(loadBrandBrain())
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setData(prev => ({ ...prev, [name]: value }))
    setSaved(false)
  }

  function handleSave() {
    saveBrandBrain(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleClear() {
    clearBrandBrain()
    setData({ ...DEFAULT_BRAND_BRAIN })
    setCleared(true)
    setTimeout(() => setCleared(false), 2500)
  }

  const isConfigured = !!(data.companyName || data.mainServices || data.targetAudience || data.brandDescription)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain size={20} className="text-brand-500" />
            <h1 className="text-2xl font-bold text-slate-900">Brand Brain</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Your Brand Brain stores your company identity, tone, and strategic context. Once saved, it automatically enriches every piece of content and brief generated — no need to re-enter it for each project.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isConfigured && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1.5 rounded-lg">
              <CheckCircle size={13} className="text-brand-500" />
              Brain Active
            </span>
          )}
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <strong>How Brand Brain works:</strong> Saved values are used as defaults across all projects. Project-level settings always override Brand Brain values. Fill in what you have — every field is optional.
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader title="Company Identity" icon={Brain} />
        <div className="space-y-4">
          <SectionTitle>Basic Info</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Company Name"
              name="companyName"
              value={data.companyName}
              onChange={handleChange}
              placeholder="e.g. Elitez Group"
            />
            <Field
              label="Website"
              name="website"
              value={data.website}
              onChange={handleChange}
              placeholder="e.g. https://elitez.asia"
            />
            <Field
              label="Primary Country / Market"
              name="country"
              value={data.country}
              onChange={handleChange}
              placeholder="e.g. Singapore"
            />
            <Field
              label="Industry"
              name="industry"
              value={data.industry}
              onChange={handleChange}
              placeholder="e.g. HR & Staffing"
            />
          </div>

          <SectionTitle>Services & Audience</SectionTitle>
          <Field
            label="Main Services (comma-separated)"
            hint="Used to generate service-specific content"
            name="mainServices"
            value={data.mainServices}
            onChange={handleChange}
            placeholder="e.g. Recruitment, Payroll Outsourcing, Employer of Record"
          />
          <Field
            label="Target Audience"
            hint="Who you're writing for"
            name="targetAudience"
            value={data.targetAudience}
            onChange={handleChange}
            placeholder="e.g. HR managers, operations directors, SME founders in Southeast Asia"
          />

          <SectionTitle>Brand Voice</SectionTitle>
          <Field
            label="Brand Tone"
            hint="How your content should sound"
            name="brandTone"
            value={data.brandTone}
            onChange={handleChange}
            placeholder="e.g. Professional, consultative, clear, trustworthy"
          />
          <Field
            label="Preferred CTA"
            hint="Your standard call-to-action phrase"
            name="preferredCTA"
            value={data.preferredCTA}
            onChange={handleChange}
            placeholder="e.g. Book a free consultation"
          />
          <Field
            label="Words to Avoid"
            hint="Filler phrases and buzzwords to exclude from all content"
            name="wordsToAvoid"
            value={data.wordsToAvoid}
            onChange={handleChange}
            placeholder="e.g. leverage, synergy, cutting-edge, game-changer, world-class"
          />

          <SectionTitle>Positioning</SectionTitle>
          <Field
            label="Unique Selling Points"
            hint="What genuinely differentiates your company"
            name="uniqueSellingPoints"
            value={data.uniqueSellingPoints}
            onChange={handleChange}
            multiline
            placeholder="e.g. 15+ years in SEA HR markets, own payroll technology, offices in SG/MY/VN"
          />
          <Field
            label="Proof Points"
            hint="Specific numbers, credentials, or track record"
            name="proofPoints"
            value={data.proofPoints}
            onChange={handleChange}
            multiline
            placeholder="e.g. 500+ clients across 8 countries, ISO 27001 certified, MOM-licensed EA"
          />
          <Field
            label="Client Types"
            hint="The types of clients you work best with"
            name="clientTypes"
            value={data.clientTypes}
            onChange={handleChange}
            placeholder="e.g. Growth-stage tech companies, regional MNCs, Singapore SMEs 20–200 headcount"
          />

          <SectionTitle>Market Context</SectionTitle>
          <Field
            label="Client Pain Points"
            hint="The real problems your clients come to you with"
            name="painPoints"
            value={data.painPoints}
            onChange={handleChange}
            multiline
            placeholder="e.g. Managing multi-country payroll manually, non-compliant contractor arrangements, slow hiring cycles"
          />
          <Field
            label="Compliance Context"
            hint="Regulatory areas most relevant to your services"
            name="complianceContext"
            value={data.complianceContext}
            onChange={handleChange}
            placeholder="e.g. MOM, CPF, Employment Act, PDPA, EPF, LHDN, Labor Code Vietnam"
          />

          <SectionTitle>Brand Voice Sample</SectionTitle>
          <Field
            label="Brand Description (for internal reference)"
            hint="One paragraph describing what you do and how you do it"
            name="brandDescription"
            value={data.brandDescription}
            onChange={handleChange}
            multiline
            placeholder="e.g. Elitez is a regional HR and staffing specialist helping businesses across Singapore, Malaysia, and Vietnam build compliant, efficient people operations..."
          />
          <Field
            label="Writing Style Sample"
            hint="Optional: paste a paragraph of your best existing content to set the tone"
            name="writingStyleSample"
            value={data.writingStyleSample}
            onChange={handleChange}
            multiline
            placeholder="Paste a sample paragraph from your website or existing content..."
          />
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} icon={Save}>
            Save Brand Brain
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-700 font-medium">
              <CheckCircle size={15} className="text-green-500" />
              Saved successfully
            </span>
          )}
          {cleared && (
            <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
              <AlertCircle size={15} />
              Brand Brain cleared
            </span>
          )}
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors font-medium"
        >
          <Trash2 size={14} />
          Clear Brand Brain
        </button>
      </div>

      {/* Status card */}
      {isConfigured && (
        <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl">
          <div className="flex items-start gap-2.5">
            <CheckCircle size={16} className="text-brand-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-brand-800 font-semibold text-sm">Brand Brain is active</p>
              <p className="text-brand-700 text-xs mt-0.5">
                Your brand context will be applied automatically when generating content briefs and articles. Project-level settings always take priority.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
