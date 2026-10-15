<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import available from '@research-originals'
const { frontmatter } = useData()
const files = computed(() => available[frontmatter.value.sourceId] || [])
</script>
<template>
  <section class="original-reader">
    <h2 id="original">原文阅读</h2>
    <p><a :href="frontmatter.canonicalUrl" target="_blank" rel="noreferrer">在原始网站查看 ↗</a></p>
    <div v-for="file in files" :key="file.url" class="pdf-panel">
      <div class="pdf-toolbar"><strong>{{ file.label }}</strong><a :href="withBase(file.url)" target="_blank" rel="noreferrer">独立打开 ↗</a><a :href="withBase(file.url)" download>下载 PDF</a></div>
      <iframe :src="withBase(file.url)" :title="`${frontmatter.title} — ${file.label}`" loading="lazy"></iframe>
    </div>
    <p v-if="!files.length" class="original-note">此构建未包含本地 PDF。可通过原始链接阅读；资料卡中的阅读范围和可获取状态分别记录。</p>
  </section>
</template>
