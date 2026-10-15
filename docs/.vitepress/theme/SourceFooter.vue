<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data } from '../data/sources.data'
const { frontmatter } = useData()
const linked = computed(() => data.filter(source => frontmatter.value.sources?.includes(source.sourceId)))
const backlinks = computed(() => data.find(s => s.sourceId === frontmatter.value.sourceId)?.backlinks || [])
</script>
<template>
  <section v-if="linked.length && !frontmatter.archived" class="related-sources"><h2>本页关联资料</h2><ul><li v-for="s in linked" :key="s.sourceId"><a :href="withBase(s.url)">{{ s.title }}</a> <small>{{ s.readingStatus }}</small></li></ul></section>
  <section v-if="backlinks.length" class="related-sources"><h2>哪些文档引用了这份资料</h2><ul><li v-for="page in backlinks" :key="page.url"><a :href="withBase(page.url)">{{ page.title }}</a></li></ul></section>
</template>
