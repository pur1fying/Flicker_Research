import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import { docsRoot, loadCatalogue, readPages } from './catalog.mjs'

const command = process.argv[2] || 'dev'
const isPublic = process.argv.includes('--public')
const subpath = process.argv.includes('--subpath')
if (!['dev', 'build', 'preview'].includes(command)) throw new Error('Unknown command')
const profile = isPublic ? 'public' : subpath ? 'subpath' : 'local'
const suffix = profile === 'local' ? '' : '-' + profile
const dist = path.join(docsRoot, '.vitepress', 'dist' + suffix)

function prepareAttachments() {
  const generatedRoot = path.resolve(docsRoot, '.vitepress', 'generated')
  const publicRoot = path.resolve(generatedRoot, 'public-' + profile)
  if (path.dirname(publicRoot) !== generatedRoot || !publicRoot.startsWith(path.resolve(docsRoot) + path.sep)) throw new Error('Invalid generated public directory')
  // Each build profile has an isolated, disposable asset tree.
  if (fs.existsSync(publicRoot)) fs.rmSync(publicRoot, { recursive: true, force: true })
  fs.mkdirSync(publicRoot, { recursive: true })
  fs.cpSync(path.join(docsRoot, 'public'), publicRoot, {
    recursive: true,
    filter: input => path.relative(path.join(docsRoot, 'public'), input).split(path.sep)[0] !== 'reference-files'
  })
  const out = path.join(publicRoot, 'reference-files')
  fs.mkdirSync(out, { recursive: true })
  // Only generated, flat attachment files inside the verified output directory.
  for (const file of fs.readdirSync(out)) {
    const target = path.resolve(out, file)
    if (path.dirname(target) !== path.resolve(out) || !fs.statSync(target).isFile()) throw new Error('Unexpected attachment output')
    fs.unlinkSync(target)
  }
  const available = {}
  const archiveRoot = path.resolve(process.env.RESEARCH_ARCHIVE_DIR || path.join(docsRoot, '..', '.research', 'sources'))
  for (const source of loadCatalogue()) {
    available[source.sourceId] = []
    for (const [i, item] of (source.attachments || []).entries()) {
      if (isPublic && item.redistributable !== true) continue
      const input = path.resolve(archiveRoot, item.file)
      if (path.dirname(input) !== archiveRoot) throw new Error('Invalid archive location')
      if (!fs.existsSync(input)) { console.warn(`Original PDF unavailable: ${source.sourceId}/${item.file}`); continue }
      const bytes = fs.readFileSync(input)
      if (crypto.createHash('sha256').update(bytes).digest('hex') !== item.sha256) throw new Error(`PDF checksum mismatch: ${source.sourceId}`)
      if (!bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error('Not a PDF')
      const name = `${source.sourceId}-${i + 1}.pdf`
      fs.writeFileSync(path.join(out, name), bytes)
      available[source.sourceId].push({ label: item.label, url: '/reference-files/' + name })
    }
  }
  fs.mkdirSync(path.join(docsRoot, '.vitepress', 'generated'), { recursive: true })
  fs.writeFileSync(path.join(generatedRoot, 'attachments-' + profile + '.json'), JSON.stringify(available))
}

if (command !== 'preview') prepareAttachments()

const args = [path.join(docsRoot, 'node_modules', 'vitepress', 'bin', 'vitepress.js'), command, docsRoot]
if (command === 'build') args.push('--outDir', dist)
if (command === 'preview') args.push('--host', '127.0.0.1', '--port', subpath ? '4174' : '4173')
if (command === 'dev') args.push('--host', '127.0.0.1', '--port', '5173')
let child
let restartRequested = false
let shuttingDown = false
let timer
let watcher
function start() {
  child = spawn(process.execPath, args, { stdio: 'inherit', env: { ...process.env, DOCS_BASE: subpath ? '/camera-research/' : '/', DOCS_PROFILE: profile } })
  child.once('exit', code => {
    if (restartRequested && !shuttingDown) {
      restartRequested = false
      prepareAttachments()
      start()
    } else {
      watcher?.close()
      process.exit(code || 0)
    }
  })
}
start()
if (command === 'dev') {
  const known = new Set(readPages().map(p => p.relative))
  watcher = fs.watch(docsRoot, { recursive: true }, (_event, name) => {
    if (!name) return
    const relative = String(name).replaceAll('\\', '/')
    if (!relative.endsWith('.md') || /(^|\/)(node_modules|\.vitepress|public)(\/|$)/.test(relative)) return
    const exists = fs.existsSync(path.join(docsRoot, relative))
    if (exists === known.has(relative)) return
    exists ? known.add(relative) : known.delete(relative)
    clearTimeout(timer)
    timer = setTimeout(() => {
      console.log('Document list changed; refreshing page routes and local search.')
      restartRequested = true
      child.kill('SIGTERM')
    }, 450)
  })
}
process.on('SIGINT', () => {
  shuttingDown = true
  clearTimeout(timer)
  watcher?.close()
  child.kill('SIGINT')
})
