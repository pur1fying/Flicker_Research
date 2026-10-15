---
{
  "title": "TI：模拟调光、PWM 与带宽",
  "sourceId": "ti-dimming",
  "sourceType": "厂商资料",
  "canonicalUrl": "https://www.ti.com/document-viewer/lit/html/SSZTAY6/GUID-1D2BF5CC-5E95-46BC-98FA-25DD8D454A3E",
  "summary": "同样的平均亮度可以来自改变电流或改变占空比，颜色与时间波形随之不同。",
  "topics": [
    "灯具与驱动",
    "光谱与颜色"
  ],
  "scenes": [
    "场景照明"
  ],
  "readingStatus": "相关章节已读",
  "accessStatus": "原文可访问",
  "checkedAt": "2026-09-16",
  "updated": "2026-09-16",
  "year": 2016,
  "evidenceHash": "5bc49a12d75369e6c10e847a582249123bede372b1762787ffdfc8010f4593f9",
  "discoveredBy": "Q019"
}
---

# TI：模拟调光、PWM 与带宽

同样的平均亮度可以来自改变电流或改变占空比，颜色与时间波形随之不同。

## 阅读范围

已读 SSZTAY6，并跟踪 [PMP15004 参考设计](https://www.ti.com/tool/PMP15004)。正文讨论模拟电流、PWM、环路带宽和 shunt-FET 调光。

## 对生成器的意义

灯具状态必须区分恒峰值 PWM 与改变电流的模拟调光；有限带宽可能改变脉冲边沿。本文的简化人眼频率表述不作为普遍安全阈值，也不作为相机无频闪条件。

<OriginalReader />
