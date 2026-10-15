---
{
  "title": "NMF vs. ICA under AC Illumination",
  "updated": "2026-09-16",
  "sourceId": "nmf-ac",
  "sourceType": "论文与数据",
  "canonicalUrl": "https://www.scitepress.org/Papers/2020/91508/91508.pdf",
  "year": 2020,
  "topics": [
    "去闪论文"
  ],
  "scenes": [
    "场景照明"
  ],
  "summary": "多灯时序分离的已有路线；与 CVPR 2023 的本征分解工作关联。",
  "checkedAt": "2026-09-16",
  "readingStatus": "书目已核对",
  "accessStatus": "原文入口已登记"
}
---

# NMF vs. ICA under AC Illumination

多灯时序分离的已有路线；与 CVPR 2023 的本征分解工作关联。

## 阅读范围

Q061 后沿参考文献补读出版方 PDF 的摘要、成像模型与合成实验段。三种合成条件使用变化方向的基图和每周期 26 点的灯具时间响应；比较曝光/噪声下的分离。

仅凭未知数个数不能保证唯一分解，论文也讨论矩阵分解歧义。本项目可用已知逐灯渲染贡献来直接监督，不必先从混合图反求所有灯。

<OriginalReader />
