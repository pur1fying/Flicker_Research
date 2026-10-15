---
{
  "title": "Kubric：固定提交审计",
  "updated": "2026-09-16",
  "scenes": [
    "场景照明"
  ],
  "topics": [
    "模拟器与标定"
  ],
  "readingStatus": "代码已核对",
  "accessStatus": "原文可访问",
  "checkedAt": "2026-09-16",
  "sourceType": "软件文档",
  "summary": "场景、资产、刚体运动与参考时刻标注；需要自定义曝光积分。",
  "sourceId": "kubric",
  "canonicalUrl": "https://github.com/google-research/kubric",
  "attachments": []
}
---

# Kubric：固定提交审计

以提交 `61f2422c84bab75006df33c6989e0b483db3ccfe` 为准。核对 Scene、Asset、View、lights、materials、cameras、PyBullet、renderer、writer 与 MOVi worker。

- RGB 是 PNG 路径，线性 EXR 需注册导出。
- 默认物理状态按视频帧保存。
- 整数 fps 与矩形灯 shape 的边界需处理。

详细证据见 [Kubric 审计](/tools/)，[扩展入口](/tools/extensions)。未运行 Blender 渲染。

<OriginalReader />
