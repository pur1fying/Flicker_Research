import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import ResearchHome from './ResearchHome.vue'
import SourceLibrary from './SourceLibrary.vue'
import PageMeta from './PageMeta.vue'
import SourceFooter from './SourceFooter.vue'
import OriginalReader from './OriginalReader.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'doc-before': () => h(PageMeta),
    'doc-after': () => h(SourceFooter)
  }),
  enhanceApp({ app }) {
    app.component('ResearchHome', ResearchHome)
    app.component('SourceLibrary', SourceLibrary)
    app.component('OriginalReader', OriginalReader)
  }
}
