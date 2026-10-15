---
{
  "title": "Analog Devices LT3965：独立通道 PWM",
  "sourceId": "adi-pwm",
  "sourceType": "厂商资料",
  "canonicalUrl": "https://www.analog.com/media/en/technical-documentation/data-sheets/LT3965-3965-1.pdf",
  "summary": "多路 LED 通道可以独立开关或 PWM，驱动组数不等于灯具外壳数量。",
  "topics": [
    "灯具与驱动"
  ],
  "scenes": [
    "场景照明"
  ],
  "readingStatus": "相关章节已读",
  "accessStatus": "原文可访问",
  "checkedAt": "2026-09-16",
  "updated": "2026-09-16",
  "discoveredBy": "Q021 → 官方数据手册",
  "attachments": [
    {
      "label": "原始文档",
      "file": "r2_adi-pdf.pdf",
      "sha256": "d6d03f6f52f913980a9cf06d27e9bfee238af2465f657bd228a470be4fdceb4d",
      "redistributable": false
    }
  ]
}
---

# Analog Devices LT3965：独立通道 PWM

多路 LED 通道可以独立开关或 PWM，驱动组数不等于灯具外壳数量。

## 阅读范围与获取

原 Burst Dimming 技术文章超时；改查官方 LT3965 数据手册，阅读首页功能与 PWM/通道描述。内部/外部时钟及八通道独立控制提供驱动模型线索。

后续已通过网页阅读工具补读原文章，单列为 [CCFL 双时钟资料](/sources/adi-burst)，因为它与本手册不是同一种驱动器或同一篇资料。

## 对数据集的意义

把颜色通道、同步时钟和渐变指令单独记录。没有执行电路仿真，不能把 PWM 设置精度当成真实灯具光输出精度。

<OriginalReader />
