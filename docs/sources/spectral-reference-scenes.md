---
title: 全光谱照明参考场景：办公室与厂房
sourceId: spectral-reference-scenes
sourceType: 数据资源
canonicalUrl: https://eta-publications.lbl.gov/publications/dataset-describing-two-reference
year: 2026
topics: [光谱与颜色, 材质与运动, 模拟器与标定]
scenes: [场景照明]
readingStatus: 项目页已核对
accessStatus: 数据入口已提供
summary: 几何、光谱材质、灯具与窗户 BSDF 的参考模型，可用于静态光谱校验，不是频闪配对数据。
checkedAt: '2026-09-16'
updated: '2026-09-16'
discoveredBy: Q051 → LBL 作者机构记录
---

# 全光谱照明参考场景

## 核对范围

已读 LBL 作者机构页面与摘要，DOI `10.1016/j.dib.2026.112922`，2026-08。未下载整个场景包或运行 Radiance/OWL。

## 资源与用途

两套参考模型为办公室和厂房，包含 CAD 几何、光谱材质/光源、窗系统 BSDF，并提供 Radiance/OWL 实现。页面描述办公室材质的现场测量与灯的光度文件和光谱。

适合作为“光谱 × 反射 × 窗户”的上游验证资源。它没有时间调制和频闪 GT，不能计成新增物理去频闪数据集。后续需单独取得数据许可和配置，再叠加经过验证的时间模型。

<OriginalReader />
