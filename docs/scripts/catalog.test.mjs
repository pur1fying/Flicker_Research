import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { loadCatalogue, readPages, validateSources } from './catalog.mjs'

test('one new Markdown source joins catalogue and resolves a reverse citation', () => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'camera-docs-test-'))
  try {
    fs.mkdirSync(path.join(root,'sources'))
    fs.writeFileSync(path.join(root,'sources','sample.md'),'---\n'+JSON.stringify({title:'相位测试',sourceId:'phase-example',sourceType:'厂商资料',canonicalUrl:'https://example.com',checkedAt:'2026-09-16',readingStatus:'相关章节已读',accessStatus:'原文可访问',topics:['快门与传感器'],scenes:['场景照明']})+'\n---\n# 相位测试\n一份新文档。')
    fs.writeFileSync(path.join(root,'overview.md'),'---\n'+JSON.stringify({title:'测试综述',sources:['phase-example']})+'\n---\n引用案例。')
    const records=loadCatalogue(root)
    assert.equal(records.length,1)
    assert.deepEqual(records[0].backlinks,[{title:'测试综述',url:'/overview'}])
    assert.deepEqual(records[0].topics,['快门与传感器'])
    assert.deepEqual(validateSources(readPages(root)),[])
  } finally {
    const resolved=path.resolve(root)
    assert.equal(path.dirname(resolved),path.resolve(os.tmpdir()))
    assert.ok(path.basename(resolved).startsWith('camera-docs-test-'))
    fs.rmSync(resolved,{recursive:true,force:true})
  }
})

test('duplicate identities, missing citations, and traversing attachments fail before building', () => {
  const valid={sourceId:'source-a',title:'测试',sourceType:'论文',canonicalUrl:'https://example.com',checkedAt:'2026-09-16',readingStatus:'摘要已读',accessStatus:'仅元数据'}
  assert.match(validateSources([valid,valid]).join('\n'),/Duplicate source ID/)
  assert.match(validateSources([{relative:'note.md',sources:['missing']}]).join('\n'),/unknown source/)
  assert.match(validateSources([{...valid,attachments:[{file:'../secret.pdf',sha256:'0'.repeat(64)}]}]).join('\n'),/invalid attachment/)
})
