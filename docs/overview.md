---
title: 研究总览
updated: '2026-09-16'
checkedAt: '2026-09-16'
sources: [burstdeflicker, iset-lfm, acam-delight, kubric, sony-understanding-flicker]
---

# 真实频闪数据集研究

我们的目标是生成**照明真实、时间一致、来源明确**的频闪输入与稳定照明真值。当前阶段专注背景调研和数据生成依据，不训练网络。

## 从三个问题开始

1. **灯如何变化？** 灯具技术、驱动、光谱与亮度档位共同决定时间响应。
2. **相机记录了什么？** 曝光、读出、帧率和传感器响应把这些变化变成条带、偏色或漏采。
3. **怎样定义干净真值？** 在相同场景运动与快门条件下，保留灯具平均照明，而不是关闭灯或平均视频帧。

## 当前结论与边界

Kubric 可以组织场景、运动和常规 RGB 光传输；灯具驱动、逐行曝光积分、相机噪声/ISP 与严格光谱验证需要额外实现。该判断来自固定提交的静态源码审计，尚未运行渲染实验。

第二轮补充了 [FlickerFix](/sources/flickerfix)、[DiffuFlicker](/sources/diffuflicker)、[滚动快门光源测量](/sources/rolling-grid)及多灯材质研究。对 ISET-LFM 的纯数学函数检查也发现：扩大默认参数范围时必须修正并验证周期积分，不能只依据“physics-based”的名称判断可直接复用。

| 阅读入口 | 主要问题 |
|---|---|
| [资料库](/library/) | 论文和厂商资料实际读到了哪一步？ |
| [成像基础](/physics/) | 光谱、时间频谱、曝光和行延迟有什么区别？ |
| [数据集比较](/datasets/) | 哪些数据与实际人像照明需求接近？ |
| [生成工具](/tools/) | Kubric 提供了哪些能力，还缺哪些环节？ |
| [检索覆盖](/research/) | 资料是如何发现的，哪些分支尚未覆盖？ |

## 优先参考

- [BurstDeflicker](/sources/burstdeflicker)：静态真实连拍与绿幕动态配对。
- [ISET-LFM](/sources/iset-lfm)：光谱光传输、独立灯组和相机模拟。
- [ACam / DELIGHT](/sources/acam-delight)：灯具实测时间响应与分色波形。
- [Sony Understanding flicker](/sources/sony-understanding-flicker)：快门与频闪关系的厂商解释。

## 如何使用本网站

正文中的原始链接用于定位具体证据；页末的资料卡链接用于查看阅读范围、关联版本和本地原文。日期报告保存在[历史区](/history/)，当前结论只维护一份。

::: info 研究状态
第二轮系统检索的记录、覆盖状态与缺口分别见[检索日志](/research/search-log)、[厂商核验](/research/vendors)和[缺口表](/research/gaps)。不会用 URL 数量代替独立资料数量。
:::
