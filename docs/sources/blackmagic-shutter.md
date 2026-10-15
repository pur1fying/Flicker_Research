---
{
  "title": "Blackmagic：快门角度与防闪建议",
  "sourceId": "blackmagic-shutter",
  "sourceType": "厂商资料",
  "canonicalUrl": "https://documents.blackmagicdesign.com/UserManuals/BlackmagicPocketCinemaCamera4KManual.pdf",
  "summary": "快门角度与曝光秒数随帧率的关系，是视频数据配置的重要条件。",
  "topics": [
    "快门与传感器"
  ],
  "scenes": [
    "场景照明"
  ],
  "readingStatus": "相关章节已读",
  "accessStatus": "原文可访问",
  "checkedAt": "2026-09-16",
  "updated": "2026-09-16",
  "attachments": [
    {
      "label": "原始文档",
      "file": "r2_blackmagic-shutter.pdf",
      "sha256": "1c2c9876dc5fd9bb75dbe18c36b82a4e7de77345dee619dd3d368e2967ecb6cc",
      "redistributable": false
    }
  ],
  "evidenceHash": "1c2c9876dc5fd9bb75dbe18c36b82a4e7de77345dee619dd3d368e2967ecb6cc",
  "discoveredBy": "Q013"
}
---

# Blackmagic：快门角度与防闪建议

快门角度与曝光秒数随帧率的关系，是视频数据配置的重要条件。

## 阅读范围

仅精读英文手册 Touchscreen Controls 中 Shutter 及 Setup 的 Flicker Free Shutter Based On，未通读多语言手册。

相机按所选 50/60 Hz 电源条件和当前帧率给出候选快门；手册说明具体灯具仍可能有残留，需实拍检查。

## 数学换算（本项目推导）

固定曝光角度 θ 时，$T=	heta/(360F)$。例如 180°、25 fps 对应 20 ms，50 fps 对应 10 ms。因此更改帧率时不能假定曝光时长不变。

<OriginalReader />
