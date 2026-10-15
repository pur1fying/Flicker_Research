<script setup lang="ts">
import { withBase } from 'vitepress'
import { data } from '../data/sources.data'
import originals from '@research-originals'
const sections = [
  ['01', '文献与资料库', '阅读论文、厂商说明与数据资源，沿着证据继续探索。', '/library/'],
  ['02', '理解频闪成像', '从光源波形到逐行曝光，区分时间、光谱与场景运动。', '/physics/'],
  ['03', '构建可信数据', '检查真值、采样条件、材质反射与真实场景的覆盖。', '/datasets/'],
  ['04', '审视生成工具', '定位 Kubric 的现有能力、配置入口与需要扩展的部分。', '/tools/']
]
</script>
<template>
  <main class="research-home">
    <section class="research-hero">
      <div class="hero-copy">
        <p class="eyebrow">COMPUTATIONAL IMAGING / 研究档案</p>
        <h1>让频闪成像，<br><span>有据可循。</span></h1>
        <p class="hero-description">围绕真实光源、相机快门与三维场景，建立可追溯、可复现的频闪数据集研究。</p>
        <div class="hero-actions"><a class="primary-action" :href="withBase('/overview')">开始阅读 <span aria-hidden="true">↗</span></a><a :href="withBase('/library/')">浏览资料库 →</a></div>
      </div>
      <div class="hero-figure" role="img" aria-label="光源时间变化经过逐行曝光，形成空间条带的概念图">
        <div class="figure-heading"><span>LIGHT → EXPOSURE → IMAGE</span><span>01 / 光与时间</span></div>
        <div class="signal-grid"><div v-for="n in 12" :key="n" :style="{ '--i': n }"></div></div>
        <div class="figure-caption"><span>光源在变化</span><span>每一行，记录不同的时刻。</span></div>
        <div class="figure-legend"><i></i> 概念示意 · 非实测信号</div>
      </div>
    </section>
    <section class="research-stats" aria-label="资料概况">
      <div><strong>{{ data.length }}</strong><span>独立资料记录</span></div>
      <div><strong>{{ Object.values(originals).filter(files => files.length).length }}</strong><span>含本地原文的资料</span></div>
      <div><strong>08</strong><span>检索与成像方向</span></div>
      <a :href="withBase('/research/')">查看覆盖与缺口 <span aria-hidden="true">↗</span></a>
    </section>
    <section class="home-section">
      <div class="section-heading"><h2>沿着问题阅读</h2><span>从原理，到数据，再到工具</span></div>
      <div class="topic-grid"><a v-for="[number,title,description,url] in sections" :key="number" :href="withBase(url)" class="topic-card"><span class="topic-number">{{ number }}</span><h3>{{ title }} <span aria-hidden="true">↗</span></h3><p>{{ description }}</p></a></div>
    </section>
    <section class="home-note"><div><p class="eyebrow">研究原则</p><h2>区分已知、推断与待验证。</h2></div><p>资料数量不代表覆盖完整。每一份核心记录都说明读过哪些部分、证据来自哪里，以及哪些问题仍未得到回答。</p><a :href="withBase('/research/gaps')">查看研究边界 →</a></section>
  </main>
</template>
