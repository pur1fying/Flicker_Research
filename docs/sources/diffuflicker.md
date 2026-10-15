---
{
  "title": "DiffuFlicker：行车视频频闪",
  "sourceId": "diffuflicker",
  "sourceType": "论文与数据",
  "canonicalUrl": "https://diffuflicker.github.io/",
  "summary": "作者页面报告 144 段合成视频，并区分快速漏采与缓慢拍频。",
  "topics": [
    "数据集与真值",
    "去闪论文"
  ],
  "scenes": [
    "汽车与信号灯"
  ],
  "readingStatus": "项目页已核对",
  "accessStatus": "数据下载待发布",
  "checkedAt": "2026-09-16",
  "updated": "2026-09-16",
  "year": 2026,
  "evidenceHash": "3051907a7c13d06e62f10eace97d59e034f95c303ee083e9a29cf22f393a8d30",
  "discoveredBy": "Q037"
}
---

# DiffuFlicker：行车视频频闪

作者页面报告 144 段合成视频，并区分快速漏采与缓慢拍频。

## 阅读范围

已读作者项目页的实验设置与数据说明；页面 Paper / Code 按钮指向 `#`，不是可用下载地址。未获得完整生成代码。

## 已核实的条件

作者页列 PWM 90/100/120 Hz × 视频 27.5/29.97 fps，评估 144 段合成序列；真实行车视频只做无 GT 的定性对比。

## 与 FlickerFix 的关系

两者作者和任务相关，但规模与实验条件不同，不把 85 和 144 合并成同一版本数据。慢拍频提醒我们要覆盖足够长的时间窗。

<OriginalReader />
