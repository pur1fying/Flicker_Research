---
{
  "title": "Rolling Shutter Imaging on the Electric Grid",
  "sourceId": "rolling-grid",
  "sourceType": "论文与数据",
  "canonicalUrl": "https://www.marksheinin.com/rollingshutter",
  "summary": "以行间时间延迟解析 AC 光照，连接灯具实测响应与滚动快门模型。",
  "topics": [
    "材质与运动",
    "快门与传感器",
    "灯具与驱动"
  ],
  "scenes": [
    "场景照明"
  ],
  "readingStatus": "相关章节已读",
  "accessStatus": "原文可访问",
  "checkedAt": "2026-09-16",
  "updated": "2026-09-16",
  "year": 2018,
  "attachments": [
    {
      "label": "原始文档",
      "file": "r2_rolling-grid.pdf",
      "sha256": "8bc1f6b0fe559cc0c637cf05fe02cc3e2bacba8fd346f0c259343574f716bf8c",
      "redistributable": false
    }
  ],
  "evidenceHash": "8bc1f6b0fe559cc0c637cf05fe02cc3e2bacba8fd346f0c259343574f716bf8c",
  "discoveredBy": "Q030"
}
---

# Rolling Shutter Imaging on the Electric Grid

以行间时间延迟解析 AC 光照，连接灯具实测响应与滚动快门模型。

## 阅读范围

已读 ICCP 2018 的成像模型、§4–5 与采集示例；作者 PDF 可本地阅读。

## 模型与数据依据

把不同光源的空间贡献与每灯 BRF、相位相加，行延迟建立空间到时间映射；灯具响应可用 DELIGHT 或现场测量。论文还使用扩散/星光滤镜让点光源分布到多个传感器行。

## 适用边界

周期稳定、曝光较短及部分表面/光源假设是前提。通过多周期重排得到的等效全局快门时间序列，不是任意动态场景的真实高速 GT。多灯混合仍可能有不可辨识性。

<OriginalReader />
