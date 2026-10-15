---
{
  "title": "ams OSRAM AS1163：相位与跨周期抖动",
  "sourceId": "osram-pwm",
  "sourceType": "厂商资料",
  "canonicalUrl": "https://look.ams-osram.com/m/30b3ff9b4cc83ae/original/AS1163-PWM-settings-multiple-driving-options.pdf",
  "summary": "真实 PWM 可有通道相位交错与 LSB dithering，单周期方波不能覆盖全部行为。",
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
  "year": 2025,
  "attachments": [
    {
      "label": "原始文档",
      "file": "r2_osram-pwm.pdf",
      "sha256": "2678b6882eac0ad7b41cb5641c67e7a998ad3fe6e7e262f7b8b69f561e2e6815",
      "redistributable": false
    }
  ],
  "evidenceHash": "2678b6882eac0ad7b41cb5641c67e7a998ad3fe6e7e262f7b8b69f561e2e6815",
  "discoveredBy": "Q023"
}
---

# ams OSRAM AS1163：相位与跨周期抖动

真实 PWM 可有通道相位交错与 LSB dithering，单周期方波不能覆盖全部行为。

## 阅读范围

精读 AN001087 v1-00（2025-04-24）的 Frequency settings 与 Dithering。模式包含标称 500 Hz/1 kHz，多个驱动按相位序列启动；LSB dithering 可使相邻周期脉宽不同。

## 对数据集的意义

新增跨周期状态、时钟误差、独立通道与相位顺序字段。示例不是所有 LED 的统一时序；仍需验证驱动电流到光输出的转换。

<OriginalReader />
