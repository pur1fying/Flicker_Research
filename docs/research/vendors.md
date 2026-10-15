---
{
  "title": "厂商与机构资料核验",
  "updated": "2026-09-16",
  "sources": [
    "sony-understanding-flicker",
    "canon-hf",
    "nikon-hf",
    "panasonic-synchro",
    "fujifilm-flicker",
    "blackmagic-shutter",
    "basler-shutter",
    "photron-pfv",
    "sony-lfm",
    "onsemi-lfm",
    "omnivision-lfm",
    "ti-dimming",
    "infineon-dimming",
    "adi-burst",
    "osram-pwm",
    "signify-tlm",
    "cie-tn012",
    "doe-tlm",
    "emva-1288",
    "mettlm"
  ]
}
---

# 厂商与机构资料核验

不是为每个品牌寻找相同菜单名，而是追踪其对应的快门、驱动、传感器或测量文档。下表保留实际阅读层级。

| 厂商 / 机构 | 发现与关联路径 | 核对范围或限制 |
|---|---|---|
| [Sony](/sources/sony-understanding-flicker) | Q002 → Understanding → shooting.html；并核对日文同页 | 正文及相邻操作页 |
| [Canon](/sources/canon-hf) | Q009 → EOS R6 III HF 页面 | 正文、设置范围与多灯/运动限制 |
| [Nikon](/sources/nikon-hf) | Q010 → 频率模式 → Video Flicker Reduction | 照片/视频两章节均已读 |
| [Panasonic](/sources/panasonic-synchro) | Q011 → BGH1 Synchro Scan | 章节正文与设置限制 |
| [Fujifilm](/sources/fujifilm-flicker) | Q012 → X-H2 SHOOTING SETTING | 快门、FLICKER REDUCTION、FLICKERLESS S.S. 三节 |
| [Blackmagic](/sources/blackmagic-shutter) | Q013 → Pocket Cinema Camera 多语言手册 | 仅英文 Shutter 与 Flicker Free 设置节 |
| [Basler](/sources/basler-shutter) | Q014 → Electronic Shutter Types → Sensor Readout Time | 快门模式及读出估计说明 |
| [Photron](/sources/photron-pfv) | Q015 → Orion；Q035 → PFV 与手册目录 | 产品页/目录；未精读整个手册，非灯具波形资源 |
| [Sony Semiconductor](/sources/sony-lfm) | Q016 → LFM 中英文技术页 | 原理正文；未获得内部电路参数 |
| [onsemi](/sources/onsemi-lfm) | Q017 → TND6372、Hayabusa 视频 | 两次官方获取403，全文列缺口 |
| [OMNIVISION](/sources/omnivision-lfm) | Q018 → OX03C10 → 关联新闻/指南入口 | 产品文字和链接，不冒充详细数据手册 |
| [TI](/sources/ti-dimming) | Q019 → SSZTAY6 → PMP15004 | PWM/模拟调光说明与参考设计 |
| [Infineon](/sources/infineon-dimming) | Q020 → LED drivers → BCR601 应用笔记 | 应用笔记配置/测量相关节 |
| [Analog Devices](/sources/adi-burst) | Q021 → 文章 → LT3965 数据手册；之后补读原文章 | 正文已通过网页工具取得，CCFL 与 LED 分开 |
| [ams OSRAM](/sources/osram-pwm) | Q023 → AS1163 应用笔记；Q047 产品目录 | 频率、相位、LSB dithering 已读 |
| [Signify](/sources/signify-tlm) | Q022 → Lighting Academy | 专题介绍和相关入口；未观看整个视频 |
| [CIE](/sources/cie-tn012) | Q024 → 技术条目与 TN012 下载 | 项目页已读；PDF超时未完成全文 |
| [DOE](/sources/doe-tlm) | Q025 → Flicker Research → 综述/基础链接 | 目录及已归档综述的相关部分 |
| [EMVA](/sources/emva-1288) | Q026 → Release4.0 → Linear 文档 | 参数定义相关节；未标定真实相机 |
| [MetTLM](/sources/mettlm) | Q027 → Results → Final Report | 波形集/测量项目与报告相关节 |

## 转化为数据条件

- 相位择时、曝光微调、每帧测量和首帧测量分开。
- 逐行读出不等于逐行曝光；GRR 还会改变每行曝光长度。
- 灯具驱动包含模拟调光、PWM、相位交错和跨周期状态，不能只按灯壳分类。
- 人眼“无闪”指标和产品宣传不能替代相机的积分、漏采与饱和验证。
