import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'node:url'

const profile = process.env.DOCS_PROFILE === 'public' ? 'public' : process.env.DOCS_PROFILE === 'subpath' ? 'subpath' : 'local'
const outputSuffix = profile === 'local' ? '' : '-' + profile

export default defineConfig({
  lang: 'zh-CN',
  title: 'Camera Research',
  description: '频闪数据集研究：从真实光源到可信的成像数据',
  base: process.env.DOCS_BASE || '/',
  outDir: fileURLToPath(new URL('./dist' + outputSuffix, import.meta.url)),
  cleanUrls: true,
  lastUpdated: false,
  vite: {
    publicDir: fileURLToPath(new URL('./generated/public-' + profile, import.meta.url)),
    resolve: { alias: { '@research-originals': fileURLToPath(new URL('./generated/attachments-' + profile + '.json', import.meta.url)) } },
    server: { watch: { ignored: ['**/.vitepress/dist/**', '**/.vitepress/dist-public/**', '**/.vitepress/dist-subpath/**', '**/generated/public-*/**', '**/public/reference-files/**'] } }
  },
  markdown: { math: true },
  head: [['meta', { name: 'theme-color', content: '#167d86' }]],
  themeConfig: {
    siteTitle: 'Camera Research',
    nav: [
      { text: '总览', link: '/overview' },
      { text: '资料库', link: '/library/' },
      { text: '成像基础', link: '/physics/' },
      { text: '数据集', link: '/datasets/' },
      { text: '生成工具', link: '/tools/' },
      { text: '检索记录', link: '/research/' }
    ],
    sidebar: [
      { text: '开始阅读', items: [{ text: '研究总览', link: '/overview' }, { text: '文献与资料库', link: '/library/' }] },
      { text: '频闪成像基础', collapsed: false, items: [
        { text: '成像链路与快门', link: '/physics/' },
        { text: '灯具、光谱与材质', link: '/physics/lighting' },
        { text: 'Sony 官方资料', link: '/physics/sony' }
      ] },
      { text: '数据集研究', collapsed: false, items: [
        { text: '数据与论文比较', link: '/datasets/' },
        { text: '真值、采样与覆盖', link: '/datasets/design' }
      ] },
      { text: '生成工具', collapsed: false, items: [
        { text: 'Kubric 能力与流程', link: '/tools/' },
        { text: '配置、扩展与边界', link: '/tools/extensions' }
      ] },
      { text: '检索与核验', collapsed: false, items: [
        { text: '检索方法与覆盖', link: '/research/' },
        { text: '发现路径与日志', link: '/research/search-log' },
        { text: '厂商资料核验', link: '/research/vendors' },
        { text: '引用追踪与收束', link: '/research/citation-tracing' },
        { text: '缺口与排除项', link: '/research/gaps' }
      ] },
      { text: '维护与历史', collapsed: true, items: [
        { text: '如何新增文档', link: '/contributing' },
        { text: '修订与验收', link: '/history/' },
        { text: '首轮报告快照', link: '/history/2026-09-16/' }
      ] }
    ],
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一页', next: '下一页' },
    darkModeSwitchLabel: '主题', sidebarMenuLabel: '目录', returnToTopLabel: '回到顶部',
    search: { provider: 'local', options: {
      _render(src, env, md) {
        const html = md.render(src, env)
        if (env.frontmatter?.search === false) return ''
        const f = env.frontmatter || {}
        const extra = [f.sourceId, f.sourceType, f.readingStatus, f.accessStatus, ...(f.topics || []), ...(f.scenes || [])].filter(Boolean).join(' ')
        return html + (extra ? md.render(extra) : '')
      },
      miniSearch: { options: { tokenize(text) {
        return [...new Intl.Segmenter('zh-CN', { granularity: 'word' }).segment(text)]
          .filter(part => part.isWordLike).map(part => part.segment.toLowerCase())
      } } },
      locales: { root: { translations: {
      button: { buttonText: '搜索研究文档', buttonAriaLabel: '搜索研究文档' },
      modal: { noResultsText: '没有找到相关文档', resetButtonTitle: '清空', displayDetails: '显示详情', footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' } }
    } } } } },
    footer: { message: '以来源为依据，让每一步研究可以追溯。', copyright: 'Camera Research · 本地研究文档' }
  }
})
