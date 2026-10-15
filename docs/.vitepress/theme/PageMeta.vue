<script setup lang="ts">
import { useData } from 'vitepress'
const { frontmatter } = useData()
</script>
<template>
  <div class="page-meta" v-if="frontmatter.updated || frontmatter.checkedAt || frontmatter.archived">
    <span v-if="frontmatter.archived" class="archived-label">历史快照 · 不作为当前结论</span>
    <span v-else-if="frontmatter.sourceId">{{ frontmatter.sourceType }} · {{ frontmatter.readingStatus }}</span>
    <span v-if="frontmatter.updated">内容更新 {{ frontmatter.updated }}</span>
    <span v-if="frontmatter.checkedAt">证据核查 {{ frontmatter.checkedAt }}</span>
  </div>
</template>
