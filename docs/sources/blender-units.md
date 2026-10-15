---
{
  "title": "Cycles：单位与 RGB 边界",
  "sourceId": "blender-units",
  "sourceType": "软件文档",
  "canonicalUrl": "https://developer.blender.org/docs/features/cycles/units/",
  "summary": "开发者文档明确区分场景线性 RGB 与光谱渲染。",
  "topics": [
    "模拟器与标定",
    "光谱与颜色"
  ],
  "scenes": [
    "场景照明"
  ],
  "readingStatus": "相关章节已读",
  "accessStatus": "原文可访问",
  "checkedAt": "2026-09-16",
  "updated": "2026-09-16",
  "evidenceHash": "7da52b21c569043851b16b302c37dc93cceb28dd8b702c99c4bfd9dbb4610123",
  "discoveredBy": "Q008"
}
---

# Cycles：单位与 RGB 边界

开发者文档明确区分场景线性 RGB 与光谱渲染。

## 阅读范围

已读 Units & Colors 的 scene-linear 和 Spectral Rendering 段。该页明确写当前路径使用 RGB、不支持完整光谱渲染。

## 对项目的影响

与 Kubric Light/Material 的 RGB 字段审计交叉支持“需要额外光谱路线”的结论；不能用 Filmic/AgX 或白平衡替代谱域物理计算。

<OriginalReader />
