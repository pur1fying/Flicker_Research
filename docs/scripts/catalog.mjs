import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

export const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export function readPages(root = docsRoot) {
  const pages = []
  function visit(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || ['node_modules', 'public', 'scripts'].includes(entry.name)) continue
      const file = path.join(dir, entry.name)
      if (entry.isDirectory()) visit(file)
      else if (entry.name.endsWith('.md')) {
        const { data, content } = matter(fs.readFileSync(file, 'utf8'))
        const relative = path.relative(root, file).replaceAll('\\', '/')
        pages.push({ ...data, relative, content, url: '/' + relative.replace(/index\.md$/, '').replace(/\.md$/, '') })
      }
    }
  }
  visit(root)
  return pages
}

export function validateSources(pages) {
  const sources = pages.filter(p => p.sourceId)
  const ids = new Set()
  const errors = []
  for (const source of sources) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(source.sourceId)) errors.push(`Invalid source ID: ${source.sourceId}`)
    if (ids.has(source.sourceId)) errors.push(`Duplicate source ID: ${source.sourceId}`)
    ids.add(source.sourceId)
    for (const key of ['title', 'sourceType', 'canonicalUrl', 'checkedAt', 'readingStatus', 'accessStatus']) {
      if (!source[key]) errors.push(`${source.sourceId}: missing ${key}`)
    }
    for (const attachment of source.attachments || []) {
      if (!/^[a-zA-Z0-9_.-]+\.pdf$/.test(attachment.file || '')) errors.push(`${source.sourceId}: invalid attachment filename`)
      if (!/^[a-f0-9]{64}$/.test(attachment.sha256 || '')) errors.push(`${source.sourceId}: missing attachment SHA256`)
    }
  }
  for (const page of pages) {
    for (const id of page.sources || []) if (!ids.has(id)) errors.push(`${page.relative}: unknown source ${id}`)
  }
  return errors
}

export function loadCatalogue(root = docsRoot) {
  const pages = readPages(root)
  const errors = validateSources(pages)
  if (errors.length) throw new Error(errors.join('\n'))
  return pages.filter(p => p.sourceId).map(({ content, relative, ...source }) => ({
    ...source,
    backlinks: pages.filter(p => !p.legacy && !p.archived && p.sources?.includes(source.sourceId))
      .map(p => ({ title: p.title || p.relative, url: p.url }))
  })).sort((a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title, 'zh-CN'))
}
