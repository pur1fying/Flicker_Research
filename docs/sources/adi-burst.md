---
title: Analog Devices：CCFL 双时钟与 Burst Dimming
sourceId: adi-burst
sourceType: 厂商资料
canonicalUrl: https://www.analog.com/en/resources/technical-articles/2022/07/16/10/04/how-to-prevent-flicker-caused-by-burst-dimming.html
year: 2009
topics: [灯具与驱动, 频闪成因]
scenes: [场景照明, 屏幕重拍]
readingStatus: 相关章节已读
accessStatus: 原文可访问
summary: 调光包络与灯时钟不同步会改变每个 burst 的有效周期数，补充固定 PWM 模型。
checkedAt: '2026-09-16'
updated: '2026-09-16'
discoveredBy: Q021 → 下载超时 → 官方网页重新读取
---

# CCFL 双时钟与 Burst Dimming

## 阅读与版本

直接抓取曾超时，随后通过网页阅读工具取得官方全文，已读原理与三种处理方式。页面正文日期为 2009-01-28；URL 中的 2022 不是原始发表年份。

## 与频闪生成的关系

DS3881/DS3882 的灯时钟与 PWM burst 不同步时，低亮度下每个 burst 包含的灯周期数会变化，形成额外亮度变化。说明波形可以由载波和慢调制两级过程构成。

对本项目，应记录两个时钟、相位关系和调光水平。该例针对 CCFL 控制器，不应直接推广到全部 LED；文中人眼阈值也不作为相机无频闪判据。

<OriginalReader />
