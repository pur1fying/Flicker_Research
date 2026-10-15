---
{
  "title": "引用追踪与阶段性收束",
  "updated": "2026-09-16",
  "sources": [
    "burstdeflicker",
    "iset-lfm",
    "acam-delight",
    "rolling-grid",
    "p2020-metrics",
    "flickerfix",
    "diffuflicker",
    "ac-intrinsic",
    "nmf-ac",
    "spectral-reference-scenes"
  ]
}
---

# 引用追踪与阶段性收束

## 两条方向

**反向：**从 BurstDeflicker、ISET-LFM、ICCP 2018、CVPR 2023 光源分离的参考文献追踪 DELIGHT、DFCG、Deegan、Behmann、Wong 和 NMF/ICA。**前向：**查询 OpenAlex citing works，再进入出版方/作者页面确认，排除电力系统、心理物理等只因词语相同而命中的作品。

[索引原始关系记录](/records/citations.json)中的 candidate 并不是自动纳入项。

## 每轮结果

| 轮次 | 实际发现 | 处理 |
|---|---|---|
| 初始 / Q001–027 | 厂商范围扩展；P2020指标、光谱测量、跨周期驱动 | 新建资料卡并阅读正文/应用笔记 |
| 扩展一 / Q028–035 | ICCP2018、ACam期刊版、相关算法任务 | 期刊版归关联版本；ICCP原文单列 |
| 扩展二 / Q036–042 + OpenAlex关系 | FlickerFix、DiffuFlicker、AC本征分解、反射与主动光谱任务 | 新数据触发继续检索；被动/主动任务分开 |
| 复核 / Q043–055 | 已有工作复现，新增静态光谱参考场景 | 参考场景作为上游校验资源，不计频闪GT |
| 追加核对 / Q056–061 | 参考场景镜像、已有NMF分离路线 | 未新增核心频闪数据/路线，补读相关出版摘要和模型段 |
| 最终核对 / Q062–064 | FlickerFix期刊PDF、既有作品与静态谱渲染相关工作 | 未新增核心频闪数据/路线；保留原文入口 |

## 索引限制

OpenAlex 中 BurstDeflicker/RIFLE 的某些版本没有后续引用，但论文正文可明确找到引用关系，不能把索引 0 当成无人引用。ACam 的引用还夹杂电网控制领域论文，未纳入照明数据集结论。Semantic Scholar 429；Google Scholar 定向查询无有效结果；Crossref 部分限流。

## 收束判断

完成新增核心条目核查后，最后两批复核没有出现新的核心物理频闪数据集或生成路线，满足本轮的阶段性停止条件。它不排除未索引、未公开或访问受限资料；[缺口](/research/gaps)继续公开保留。
