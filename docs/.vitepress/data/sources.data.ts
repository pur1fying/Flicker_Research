import { loadCatalogue } from '../../scripts/catalog.mjs'

export default {
  watch: ['../../sources/*.md', '../../physics/*.md', '../../datasets/*.md', '../../tools/*.md', '../../research/*.md', '../../*.md'],
  load() { return loadCatalogue() }
}
export declare const data: any[]
