// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT DIFF UTILITY
// Paragraph-level diff between two article body strings.
// Returns added/removed paragraphs and a human-readable summary.
// ═══════════════════════════════════════════════════════════════════════════════

function countWords(text) {
  return (text || '').split(/\s+/).filter(Boolean).length
}

// Split body into meaningful blocks (headings + paragraphs)
function toBlocks(body) {
  return (body || '').split('\n\n').map(b => b.trim()).filter(Boolean)
}

export function computeDiff(bodyBefore, bodyAfter) {
  if (!bodyBefore && !bodyAfter) return null
  if (bodyBefore === bodyAfter) {
    return {
      hasChanges:   false,
      added:        [],
      removed:      [],
      wordsBefore:  countWords(bodyBefore),
      wordsAfter:   countWords(bodyAfter),
      wordsAdded:   0,
      summary:      ['No changes detected'],
    }
  }

  const blocksBefore = toBlocks(bodyBefore)
  const blocksAfter  = toBlocks(bodyAfter)

  const beforeSet = new Set(blocksBefore)
  const afterSet  = new Set(blocksAfter)

  const added   = blocksAfter.filter(b => !beforeSet.has(b))
  const removed = blocksBefore.filter(b => !afterSet.has(b))

  const wordsBefore = countWords(bodyBefore)
  const wordsAfter  = countWords(bodyAfter)
  const wordsAdded  = wordsAfter - wordsBefore
  const sign        = wordsAdded >= 0 ? '+' : ''

  // Count new sections (H2 headings added)
  const newH2s = added.filter(b => /^##\s/.test(b)).map(b => b.replace(/^##\s+/, '').split('\n')[0])

  const summary = []
  if (newH2s.length > 0)    summary.push(`${newH2s.length} new section${newH2s.length > 1 ? 's' : ''} added: ${newH2s.join(', ')}`)
  else if (added.length > 0) summary.push(`${added.length} new block${added.length > 1 ? 's' : ''} added`)
  if (removed.length > 0)   summary.push(`${removed.length} block${removed.length > 1 ? 's' : ''} modified`)
  if (wordsAdded !== 0)     summary.push(`${sign}${wordsAdded} words (${wordsBefore.toLocaleString()} → ${wordsAfter.toLocaleString()})`)

  return {
    hasChanges: true,
    added:      added.slice(0, 8),    // cap for display
    removed:    removed.slice(0, 4),
    newH2s,
    wordsBefore,
    wordsAfter,
    wordsAdded,
    summary,
  }
}

// Computes a simple diff between two full content objects (meta + body)
export function computeContentDiff(before, after) {
  const changes = []

  if (before?.metaTitle !== after?.metaTitle && after?.metaTitle) {
    changes.push({ field: 'Meta Title', before: before?.metaTitle || '(none)', after: after.metaTitle })
  }
  if (before?.metaDescription !== after?.metaDescription && after?.metaDescription) {
    changes.push({ field: 'Meta Description', before: before?.metaDescription || '(none)', after: after.metaDescription })
  }

  const bodyDiff = computeDiff(before?.body, after?.body)

  return {
    metaChanges:  changes,
    body:         bodyDiff,
    hasChanges:   changes.length > 0 || bodyDiff?.hasChanges,
    wordsBefore:  bodyDiff?.wordsBefore || 0,
    wordsAfter:   bodyDiff?.wordsAfter  || 0,
  }
}
