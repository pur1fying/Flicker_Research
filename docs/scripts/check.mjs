import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { docsRoot, readPages, validateSources } from './catalog.mjs'

const pages = readPages()
const errors = validateSources(pages)
const warnings = []
const sourceIds = new Set(pages.filter(p => p.sourceId).map(p => p.sourceId))
const pageSet = new Set(pages.map(p => p.url.replace(/\/$/, '') || '/'))
function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir,entry.name)) : [path.join(dir,entry.name)])
}
for (const page of pages) {
  for (const id of page.sources || []) if (!sourceIds.has(id)) errors.push(`Unknown citation ${id}: ${page.relative}`)
  for (const match of page.content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1]
    if (/^(https?:|mailto:|#)/.test(target)) continue
    const pathname = target.split('#')[0]
    const relative = pathname.startsWith('/') ? pathname.slice(1) : path.posix.join(path.posix.dirname(page.relative),pathname)
    const normalized = '/' + path.posix.normalize(relative).replace(/\.md$/, '').replace(/index$/, '')
    if (pageSet.has(normalized.replace(/\/$/,'') || '/')) continue
    if (fs.existsSync(path.join(docsRoot,relative)) || fs.existsSync(path.join(docsRoot,'public',relative))) continue
    errors.push(`Missing local target ${target}: ${page.relative}`)
  }
  for (const item of page.attachments || []) {
    const file = path.resolve(docsRoot,'..','.research','sources',item.file)
    if (!fs.existsSync(file)) { warnings.push(`Unavailable local original: ${page.sourceId}`); continue }
    if (crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') !== item.sha256) errors.push(`Wrong SHA256: ${page.sourceId}`)
  }
}

let checkedLinks=0
for (const profile of ['dist','dist-subpath','dist-public']) {
  const root = path.join(docsRoot,'.vitepress',profile)
  if (!fs.existsSync(root)) continue
  const base = profile==='dist-subpath' ? '/camera-research/' : '/'
  const htmlFiles=walk(root).filter(f=>f.endsWith('.html'))
  const idCache=new Map()
  for (const file of htmlFiles) {
    const html=fs.readFileSync(file,'utf8')
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const href=match[1].replaceAll('&amp;','&')
      if (/^(https?:|data:|mailto:|javascript:|about:|\/\/)/.test(href) || !href) continue
      const relative=path.relative(root,file).replaceAll('\\','/')
      const url=new URL(href,'http://localhost'+base+relative)
      let urlPath=decodeURIComponent(url.pathname)
      if (base!=='/' && !urlPath.startsWith(base)) { errors.push(`${profile}: link escapes base: ${href}`);continue }
      urlPath=urlPath.slice(base.length)
      let target=path.resolve(root,urlPath || 'index.html')
      if (!target.startsWith(path.resolve(root)+path.sep)) {errors.push(`Out-of-root link: ${href}`);continue}
      if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target=path.join(target,'index.html')
      if (!fs.existsSync(target) && fs.existsSync(target+'.html'))target+='.html'
      if (!fs.existsSync(target)){errors.push(`${profile}/${relative}: missing ${href}`);continue}
      checkedLinks++
      if (url.hash && target.endsWith('.html')) {
        if (!idCache.has(target)) idCache.set(target,new Set([...fs.readFileSync(target,'utf8').matchAll(/\bid="([^"]+)"/g)].map(m=>m[1])))
        if (!idCache.get(target).has(decodeURIComponent(url.hash.slice(1)))) errors.push(`${profile}/${relative}: missing anchor ${href}`)
      }
    }
  }
  if(profile==='dist-public') {
    const expected=new Set(pages.flatMap(p=>(p.attachments||[]).flatMap((a,i)=>a.redistributable===true?[`${p.sourceId}-${i+1}.pdf`]:[])))
    const copied=walk(path.join(root,'reference-files')).filter(p=>p.endsWith('.pdf'))
    for(const file of copied)if(!expected.has(path.basename(file)))errors.push(`Public build contains non-redistributable original: ${file}`)
  }
}
const uniqueErrors=[...new Set(errors)]
const result={pages:pages.length,sources:sourceIds.size,checkedLinks,warnings:[...new Set(warnings)],errors:uniqueErrors}
console.log(JSON.stringify(result,null,2))
if (process.argv.includes('--save')) {
  fs.mkdirSync(path.join(docsRoot,'.vitepress','generated'),{recursive:true})
  fs.writeFileSync(path.join(docsRoot,'.vitepress','generated','check-result.json'),JSON.stringify(result,null,2))
}
process.exitCode=uniqueErrors.length?1:0
