---
{
  "title": "MIRAGE / CLEAR",
  "updated": "2026-09-16",
  "scenes": [
    "屏幕重拍"
  ],
  "topics": [
    "数据集与真值",
    "去闪论文"
  ],
  "year": 2026,
  "readingStatus": "相关章节已读",
  "accessStatus": "数据下载待发布",
  "checkedAt": "2026-09-16",
  "sourceType": "论文与数据",
  "summary": "联合摩尔纹与频闪的屏幕重拍数据，约 3,000 对。",
  "sourceId": "clear-mirage",
  "canonicalUrl": "https://arxiv.org/abs/2602.01559",
  "attachments": [
    {
      "label": "论文原文",
      "file": "clear_mirage.pdf",
      "sha256": "ccd3a78166d39170bed9cbdbbb53287379afefeb1e71e68461924732ce62e0e3",
      "redistributable": false
    }
  ]
}
---

# MIRAGE / CLEAR


- 约 3,000 对屏幕重拍图像：频闪、摩尔纹、二者混合各约 1,000 对；每类按 930/20/50 分训练/验证/测试。
- 5 部手机，LCD/LED/OLED 三类显示技术；内容覆盖自然图像、文档、网页、卡通、游戏和界面。
- 参考来自原始显示内容经配准；额外合成经过逆 ISP、伪 RAW 条带处理、正向 ISP。
- 项目页的数据按钮为 **Coming Soon**；代码链接存在，但本轮未取得可用数据下载包。

判断：联合退化是重要补充；逆 ISP 所得伪 RAW 不能等同于已知光谱与传感器响应生成的 RAW。屏幕子域应单独评估。

来源：[论文](https://arxiv.org/abs/2602.01559)、[作者项目页](https://libozhu03.github.io/CLEAR/)。



<OriginalReader />
