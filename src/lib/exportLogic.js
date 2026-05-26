// ─── Markdown → HTML Converter ────────────────────────────────────────────────

function mdToHtml(md) {
  if (!md) return ''
  let html = md

  // H1–H3
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // Bold & italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Bullet lists — group consecutive items
  html = html.replace(/((?:^[-*]\s+.+\n?)+)/gm, match => {
    const items = match.trim().split('\n').map(line =>
      `  <li>${line.replace(/^[-*]\s+/, '').trim()}</li>`
    ).join('\n')
    return `<ul>\n${items}\n</ul>\n`
  })

  // Numbered lists
  html = html.replace(/((?:^\d+\.\s+.+\n?)+)/gm, match => {
    const items = match.trim().split('\n').map(line =>
      `  <li>${line.replace(/^\d+\.\s+/, '').trim()}</li>`
    ).join('\n')
    return `<ol>\n${items}\n</ol>\n`
  })

  // Paragraphs (non-tag lines)
  html = html.replace(/^(?!<[a-z]|\s*$)(.+)$/gm, '<p>$1</p>')

  // Clean up extra newlines
  html = html.replace(/\n{3,}/g, '\n\n').trim()

  return html
}

// ─── FAQ Schema JSON-LD ───────────────────────────────────────────────────────

function buildFAQSchema(faqs, url) {
  if (!faqs || faqs.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'url': url || 'https://yourwebsite.com/blog/your-page',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.a,
      },
    })),
  }
}

// ─── Article Schema JSON-LD ───────────────────────────────────────────────────

function buildArticleSchema(content, project, brief) {
  const { companyName = 'Your Company', website = 'https://yourwebsite.com' } = project
  const { title = '', metaDescription = '', createdAt = '' } = content

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': title,
    'description': metaDescription,
    'author': {
      '@type': 'Organization',
      'name': companyName,
      'url': website,
    },
    'publisher': {
      '@type': 'Organization',
      'name': companyName,
      'url': website,
    },
    'datePublished': createdAt || new Date().toISOString(),
    'dateModified': new Date().toISOString(),
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `${website}/blog/${brief?.slug || ''}`,
    },
  }
}

// ─── Image Alt Text Suggestions ───────────────────────────────────────────────

function buildImageAlts(content, brief, project) {
  const kw       = brief?.targetKeyword || content?.targetKeyword || 'keyword'
  const company  = project?.companyName || 'Company'
  const audience = (project?.targetAudience || '').split(',')[0]?.trim() || 'businesses'

  return [
    { position: 'Hero / Featured Image',    alt: `${kw} — ${company}` },
    { position: 'Section 1 Illustration',   alt: `How ${kw} works for ${audience}` },
    { position: 'Section 2 Chart/Graphic',  alt: `${kw} benefits overview` },
    { position: 'Team / Process Photo',     alt: `${company} team working on ${kw}` },
    { position: 'CTA Banner',               alt: `Get ${kw} support from ${company}` },
  ]
}

// ─── LinkedIn Caption ─────────────────────────────────────────────────────────

function buildLinkedInCaption(content, project, brief) {
  const kw      = brief?.targetKeyword || content?.targetKeyword || 'this topic'
  const company = project?.companyName || 'We'
  const url     = project?.website || 'https://yourwebsite.com'
  const title   = content?.title || 'New Article'

  return `📈 **${title}**

If you're thinking about ${kw}, this is worth a read.

We cover:
✅ What ${kw} actually means for your business
✅ The most common mistakes to avoid
✅ A practical framework to get started

👉 Read the full guide: ${url}/blog/${brief?.slug || ''}

What's your biggest challenge with ${kw}? Let us know in the comments 👇

#SEO #${(kw || '').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')} #ContentMarketing #BusinessGrowth`
}

// ─── Placeholder detector ─────────────────────────────────────────────────────

function detectPlaceholders(body) {
  const PLACEHOLDER_RE = /\[(?:add |insert|your |describe|specific|example\]|timeframe\]|detail\]|x\]|key |common |factors|deliverable|step |locations|satisfaction|contract |engagement |red flag|technical|simple |pricing|outcome|reporting|fundamental|realistic |commonly )/gi
  return (body.match(PLACEHOLDER_RE) || []).length
}

// ─── WordPress Export Builder ─────────────────────────────────────────────────

export function buildWordPressExport(content, brief, project, score) {
  if (!content) return null

  const html          = mdToHtml(content.body || '')
  const faqSchema     = buildFAQSchema(brief?.faqs || [], `${project?.website || ''}/${brief?.slug || ''}`)
  const articleSchema = buildArticleSchema(content, project, brief)
  const imageAlts     = buildImageAlts(content, brief, project)
  const linkedin      = buildLinkedInCaption(content, project, brief)

  const focusKeyphrase  = content.focusKeyphrase || brief?.focusKeyphrase || brief?.targetKeyword || ''
  const placeholderCount = detectPlaceholders(content.body || '')
  const hasPlaceholders  = placeholderCount > 0
  const brandBrainApplied = brief?.brandBrainApplied || false

  const fullHtml = `<!-- SEO Growth Engine Export -->
<!-- Meta Title: ${content.metaTitle || ''} -->
<!-- Meta Description: ${content.metaDescription || ''} -->
<!-- Focus Keyphrase: ${focusKeyphrase} -->
<!-- Slug: ${brief?.slug || ''} -->
${hasPlaceholders ? `<!-- ⚠ WARNING: ${placeholderCount} unresolved placeholder(s) detected. Do not publish without reviewing. -->` : ''}

${html}

<!-- FAQ Schema — paste in page head or Yoast/RankMath schema field -->
<!--
${JSON.stringify(faqSchema, null, 2)}
-->

<!-- Article Schema — paste in page head -->
<!--
${JSON.stringify(articleSchema, null, 2)}
-->`

  return {
    metaTitle:         content.metaTitle || '',
    metaDescription:   content.metaDescription || '',
    focusKeyphrase,
    slug:              brief?.slug || '',
    htmlBody:          html,
    fullExport:        fullHtml,
    faqSchemaJSON:     JSON.stringify(faqSchema, null, 2),
    articleSchemaJSON: JSON.stringify(articleSchema, null, 2),
    imageAlts,
    linkedInCaption:   linkedin,
    wordCount:         content.wordCount || 0,
    hasPlaceholders,
    placeholderCount,
    brandBrainApplied,
    exportedAt:        new Date().toISOString(),
  }
}
