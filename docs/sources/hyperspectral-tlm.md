---
{
  "title": "高光谱相机测量 TLM",
  "sourceId": "hyperspectral-tlm",
  "sourceType": "论文与数据",
  "canonicalUrl": "https://doi.org/10.1088/1361-6501/ae16c7",
  "summary": "等效时间采样和分波段测量可研究彩色频闪，但依赖周期稳定。",
  "topics": [
    "光谱与颜色",
    "模拟器与标定"
  ],
  "scenes": [
    "场景照明"
  ],
  "readingStatus": "相关章节已读",
  "accessStatus": "原文可访问",
  "checkedAt": "2026-09-16",
  "updated": "2026-09-16",
  "year": 2025,
  "attachments": [
    {
      "label": "原始文档",
      "file": "r2_hyperspectral-tlm.pdf",
      "sha256": "9d835f9ab6b3140c29ce9f1adbf2c7a656ee2c3a495434fdb986ef9053050844",
      "redistributable": true
    }
  ],
  "evidenceHash": "9d835f9ab6b3140c29ce9f1adbf2c7a656ee2c3a495434fdb986ef9053050844",
  "discoveredBy": "Q004"
}
---

# 高光谱相机测量 TLM

等效时间采样和分波段测量可研究彩色频闪，但依赖周期稳定。

## 阅读范围

精读 Mantela 等（2025）Measurement Science and Technology 36 127001 的 §2–3、图 1–3 与测量讨论。Aalto 开放版原文为 CC BY 4.0。

## 测量链路

光电计提供参考信号，微控制器以不同延迟触发高光谱相机；把不同周期的样本组合，获得更细的等效时间采样。实验考察 450/550/650 nm 等波段。

## 关键限制

不能把 100→1000 的等效采样能力写成相机能实时捕获任意 1000 fps 彩色视频。变化/非周期过程、触发抖动与仪器滤波需要单独校验；RGBW 的多个通道可能有不同时间响应。

<OriginalReader />
