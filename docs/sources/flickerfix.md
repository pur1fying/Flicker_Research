---
{
  "title": "FlickerFix：信号灯 ROI 频闪数据",
  "sourceId": "flickerfix",
  "sourceType": "论文与数据",
  "canonicalUrl": "https://doi.org/10.5909/JBE.2025.30.7.1185",
  "summary": "明确区分分割 ROI 图像与合成频闪视频，不能混算数据规模。",
  "topics": [
    "数据集与真值",
    "去闪论文"
  ],
  "scenes": [
    "汽车与信号灯"
  ],
  "readingStatus": "相关章节已读",
  "accessStatus": "数据包未核实",
  "checkedAt": "2026-09-16",
  "updated": "2026-09-16",
  "year": 2025,
  "evidenceHash": "e067f144c7587efe602f8934ec42f8e739f4c094dcf4dc6549afc5e75c38e39e",
  "discoveredBy": "OpenAlex p2020-metrics → citing"
}
---

# FlickerFix：信号灯 ROI 频闪数据

明确区分分割 ROI 图像与合成频闪视频，不能混算数据规模。

## 阅读范围

已读出版方英文正文的 Synthetic Datasets Generation 和 Algorithm 1。Q036 同名查询误命中游戏模组，随后沿 OpenAlex DOI 到达期刊全文，排除同名结果。

## 数据与生成

536,028 是 ROI 图像/伪掩码条目；另有 85 对合成频闪视频。视频使用 27.5 fps，PWM 120/150/180 Hz，曝光 2/5 ms，占空比 0.3/0.5/0.7。算法采样 PWM，另加非线性映射，在信号掩码内混合原图与暗背景。

## 真值和边界

原视频为合成前参考；真实行车样例没有同条件干净 GT。非线性增强与掩码混合不是完整三维辐射积分。未核实到独立可下载的数据包。

<OriginalReader />
