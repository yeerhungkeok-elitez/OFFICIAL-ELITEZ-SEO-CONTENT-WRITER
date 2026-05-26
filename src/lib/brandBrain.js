const BRAND_BRAIN_KEY = 'seo_brand_brain_v1'

export const DEFAULT_BRAND_BRAIN = {
  companyName:        '',
  website:            '',
  country:            '',
  industry:           '',
  mainServices:       '',
  targetAudience:     '',
  brandTone:          'Professional, consultative, clear, trustworthy',
  preferredCTA:       'Book a free consultation',
  wordsToAvoid:       'leverage, synergy, cutting-edge, game-changer, best-in-class, world-class, revolutionize',
  uniqueSellingPoints:'',
  proofPoints:        '',
  clientTypes:        '',
  painPoints:         '',
  complianceContext:  '',
  brandDescription:   '',
  writingStyleSample: '',
}

export function loadBrandBrain() {
  try {
    const raw = localStorage.getItem(BRAND_BRAIN_KEY)
    return raw ? { ...DEFAULT_BRAND_BRAIN, ...JSON.parse(raw) } : { ...DEFAULT_BRAND_BRAIN }
  } catch {
    return { ...DEFAULT_BRAND_BRAIN }
  }
}

export function saveBrandBrain(data) {
  localStorage.setItem(BRAND_BRAIN_KEY, JSON.stringify({ ...DEFAULT_BRAND_BRAIN, ...data }))
}

export function clearBrandBrain() {
  localStorage.removeItem(BRAND_BRAIN_KEY)
}

export function isBrandBrainConfigured() {
  const bb = loadBrandBrain()
  return !!(bb.companyName || bb.mainServices || bb.targetAudience || bb.brandDescription)
}

// Merges Brand Brain with project — project values always win on overlap
export function mergeBrandBrainWithProject(project) {
  if (!isBrandBrainConfigured()) return { project, brandBrainApplied: false }
  const bb = loadBrandBrain()
  const merged = {
    companyName:        project.companyName     || bb.companyName     || '',
    website:            project.website         || bb.website         || '',
    country:            project.country         || bb.country         || '',
    industry:           project.industry        || bb.industry        || '',
    services:           project.services        || bb.mainServices    || '',
    targetAudience:     project.targetAudience  || bb.targetAudience  || '',
    tone:               project.tone            || bb.brandTone       || '',
    preferredCTA:       bb.preferredCTA         || project.preferredCTA || '',
    wordsToAvoid:       bb.wordsToAvoid         || '',
    uniqueSellingPoints:bb.uniqueSellingPoints  || '',
    proofPoints:        bb.proofPoints          || '',
    clientTypes:        bb.clientTypes          || '',
    painPoints:         bb.painPoints           || '',
    complianceContext:  bb.complianceContext    || '',
    brandDescription:   bb.brandDescription     || '',
    writingStyleSample: bb.writingStyleSample   || '',
    ...project,
  }
  return { project: merged, brandBrainApplied: true, brandBrainData: bb }
}
