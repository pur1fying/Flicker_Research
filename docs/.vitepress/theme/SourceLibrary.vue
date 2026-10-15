<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { withBase } from 'vitepress'
import { data } from '../data/sources.data'
const query = ref('')
const selected = reactive({ scene: '', sourceType: '', topic: '', year: '', readingStatus: '', accessStatus: '' })
const labels = { scene: '应用场景', sourceType: '资料类型', topic: '研究主题', year: '年份', readingStatus: '阅读程度', accessStatus: '资源状态' }
function values(key: string) {
  return [...new Set(data.flatMap(s => key === 'topic' ? s.topics || [] : key === 'scene' ? s.scenes || [] : [String(s[key] || '')]).filter(Boolean))].sort((a: string,b: string) => key === 'year' ? Number(b)-Number(a) : a.localeCompare(b,'zh-CN'))
}
const filtered = computed(() => data.filter(source => {
  const text = [source.title,source.subtitle,source.summary,source.sourceId,...source.topics || [],...source.scenes || []].join(' ').toLowerCase()
  return query.value.toLowerCase().trim().split(/\s+/).every(term => text.includes(term)) && Object.entries(selected).every(([key,value]) => !value || (key === 'scene' ? source.scenes || [] : key === 'topic' ? source.topics || [] : [String(source[key])]).includes(value))
}))
function reset() { query.value=''; for(const key in selected) selected[key]='' }
</script>
<template>
  <section class="library-controls" aria-label="筛选研究资料">
    <label class="library-query">在资料库内查找<input v-model="query" type="search" placeholder="论文、作者、厂商或关键词，如 Sony / PWM / 真值" /></label>
    <div class="filter-grid"><label v-for="(label,key) in labels" :key="key">{{ label }}<select v-model="selected[key]"><option value="">全部{{ label }}</option><option v-for="value in values(key)" :value="value" :key="value">{{ value }}</option></select></label></div>
    <div class="library-count"><span role="status" aria-live="polite">找到 <strong>{{ filtered.length }}</strong> / {{ data.length }} 份资料</span><button type="button" @click="reset">清除筛选</button></div>
  </section>
  <div class="source-grid">
    <article v-for="source in filtered" :key="source.sourceId" class="source-card">
      <div class="card-topline"><span>{{ source.sourceType }}</span><span>{{ source.year || '未标注年份' }}</span></div>
      <h2><a :href="withBase(source.url)">{{ source.title }}</a></h2>
      <p v-if="source.subtitle" class="source-subtitle">{{ source.subtitle }}</p>
      <p>{{ source.summary }}</p>
      <div class="source-tags"><span v-for="topic in source.topics" :key="topic">{{ topic }}</span></div>
      <div class="card-status"><span>{{ source.readingStatus }}</span><span>{{ source.accessStatus }}</span></div>
    </article>
  </div>
  <div v-if="!filtered.length" class="empty-library"><h2>暂未找到匹配资料</h2><p>尝试减少条件或换一个中英文关键词。</p><button type="button" @click="reset">显示全部资料</button></div>
</template>
