---
{
  "title": "Basler：曝光、读出与 GRR",
  "sourceId": "basler-shutter",
  "sourceType": "厂商资料",
  "canonicalUrl": "https://docs.baslerweb.com/electronic-shutter-types",
  "summary": "逐行读取不必然意味着逐行曝光；全局复位释放也不是全局快门。",
  "topics": [
    "快门与传感器",
    "模拟器与标定"
  ],
  "scenes": [
    "场景照明"
  ],
  "readingStatus": "相关章节已读",
  "accessStatus": "原文可访问",
  "checkedAt": "2026-09-16",
  "updated": "2026-09-16",
  "evidenceHash": "a8450e86ba559b498299c53d8fa6fd47057e44c2904c3e384289d553c82ed229",
  "discoveredBy": "Q014"
}
---

# Basler：曝光、读出与 GRR

逐行读取不必然意味着逐行曝光；全局复位释放也不是全局快门。

## 阅读范围

已读 Global / Rolling / Global Reset Release 章节，并跟踪 [Sensor Readout Time](https://docs.baslerweb.com/sensor-readout-time)。

全局快门可在同时曝光结束后逐行读出。GRR 同时开始但不同行结束时间不同，在不合适的照明下可能产生行亮度差。SensorReadoutTime 是受 ROI、binning 等影响的近似读出值。

## 对生成器的意义

分别定义每行开始/结束时间；不能把总数据读出时长直接当作首末行曝光开始差。当前常规视频模型之外，GRR 作为明确的可选子集。

<OriginalReader />
