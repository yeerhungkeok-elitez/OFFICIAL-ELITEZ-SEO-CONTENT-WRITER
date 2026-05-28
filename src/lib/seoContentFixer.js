// ═══════════════════════════════════════════════════════════════════════════════
// SEO CONTENT FIXER
// Fixes specific SEO gaps: keyphrase in intro, meta title, meta description.
// All fixes are additive / replacement only — nothing is deleted.
// ═══════════════════════════════════════════════════════════════════════════════

function countWords(text) {
  return (text || '').split(/\s+/).filter(Boolean).length
}

function getKeyword(content, brief) {
  return (brief?.focusKeyphrase || brief?.targetKeyword || content?.targetKeyword || '').trim()
}

// ── Fix: add focus keyphrase to intro paragraph ───────────────────────────────

export function fixFocusKeyphraseInIntro(content, brief, project) {
  const keyword = getKeyword(content, brief)
  if (!keyword) return content

  const body    = content.body || ''
  const kwLower = keyword.toLowerCase()

  // Get first 200 words of non-heading content
  const introWords = body.split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .join(' ')
    .split(/\s+/)
    .slice(0, 200)
    .join(' ')
    .toLowerCase()

  if (introWords.includes(kwLower)) return content // already present — no change

  // Find first non-heading, non-empty paragraph to append a sentence
  const lines = body.split('\n')
  let targetIdx = -1
  let afterTitle = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.startsWith('# ')) { afterTitle = true; continue }
    if (!afterTitle) continue
    if (!line || line.startsWith('#')) continue
    targetIdx = i
    break
  }

  if (targetIdx === -1) return content

  const aud     = (project?.targetAudience || brief?.audience || '').split(',')[0]?.trim() || 'businesses'
  const kwBold  = `**${keyword.charAt(0).toUpperCase() + keyword.slice(1)}**`
  const sentence = ` This guide covers what ${aud} need to know about ${kwBold} — from first principles to practical implementation.`

  const updated = [...lines]
  updated[targetIdx] = lines[targetIdx] + sentence

  const newBody = updated.join('\n')
  return { ...content, body: newBody, wordCount: countWords(newBody) }
}

// ── Fix: improve meta title ───────────────────────────────────────────────────

export function fixMetaTitle(content, brief, project) {
  const keyword = getKeyword(content, brief)
  if (!keyword) return content

  const current = content.metaTitle || ''
  const kwLower = keyword.toLowerCase()
  const company = project?.companyName || 'Our Team'

  // Already good — keyword present and length in range
  if (current.toLowerCase().includes(kwLower) && current.length >= 45 && current.length <= 65) {
    return content
  }

  const kwTitle = keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  const candidates = [
    `${kwTitle} | ${company}`,
    `${kwTitle} — ${company}`,
    `${kwTitle}: Expert Guide | ${company}`,
    `${kwTitle}: What You Need to Know | ${company}`,
  ]

  const newTitle = candidates.find(c => c.length >= 45 && c.length <= 62)
    || candidates[0].slice(0, 59) + '...'

  return { ...content, metaTitle: newTitle }
}

// ── Fix: improve meta description ─────────────────────────────────────────────

export function fixMetaDescription(content, brief, project) {
  const keyword = getKeyword(content, brief)
  if (!keyword) return content

  const current = content.metaDescription || ''
  const kwLower = keyword.toLowerCase()
  const company = project?.companyName || 'our team'
  const country = project?.country && !/global|remote/i.test(project.country || '') ? ` in ${project.country}` : ''
  const aud     = (project?.targetAudience || brief?.audience || '').split(',')[0]?.trim() || 'businesses'

  // Already good — keyword present, length in range
  if (current.toLowerCase().includes(kwLower) && current.length >= 128 && current.length <= 162) {
    return content
  }

  const kwTitle = keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const funnel  = brief?.funnel || 'TOFU'

  let desc
  if (funnel === 'BOFU') {
    desc = `Ready to get started with ${kwTitle.toLowerCase()}${country}? ${company} works with ${aud} who need a practical, low-risk path forward. Book a free 30-minute consultation today.`
  } else if (funnel === 'MOFU') {
    desc = `Comparing ${kwTitle.toLowerCase()} options${country}? ${company} provides an honest breakdown of what works, what to avoid, and how to choose the right fit for your business.`
  } else {
    desc = `Practical, honest guidance on ${kwTitle.toLowerCase()} for ${aud}${country}. ${company} covers what actually works — from getting started to scaling with confidence. Read the guide.`
  }

  if (desc.length > 162) desc = desc.slice(0, 159) + '...'
  if (desc.length < 128) {
    desc = `Everything ${aud}${country} need to know about ${kwTitle.toLowerCase()}. ${company} provides expert, practical guidance — from fundamentals to implementation. Read the full guide.`
    if (desc.length > 162) desc = desc.slice(0, 159) + '...'
  }

  return { ...content, metaDescription: desc }
}
