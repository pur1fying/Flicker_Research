---
{
  "title": "ACam / DELIGHT",
  "updated": "2026-09-16",
  "scenes": [
    "场景照明"
  ],
  "topics": [
    "灯具与驱动",
    "光谱与颜色"
  ],
  "year": 2017,
  "readingStatus": "相关章节已读",
  "accessStatus": "数据入口已提供",
  "checkedAt": "2026-09-16",
  "sourceType": "论文与数据",
  "summary": "灯具实测时间响应，包含不同驱动和部分颜色分带测量。",
  "sourceId": "acam-delight",
  "canonicalUrl": "https://www.dgp.toronto.edu/ACam/",
  "attachments": [
    {
      "label": "论文原文",
      "file": "acam.pdf",
      "sha256": "58bdd64a7ccfb5953d44982c4945392b9a5fb6aa9f0e290bc86f7dd0bc9b918e",
      "redistributable": false
    },
    {
      "label": "补充材料",
      "file": "delight_supp.pdf",
      "sha256": "4d5567b47420210c385eb1aacfbaa8dea344911f80e55583397ce7d1cc5386cf",
      "redistributable": false
    }
  ]
}
---

# ACam / DELIGHT


DELIGHT 是**灯具时间响应数据库**，不是配对去闪视频。它包括多种 LED、荧光灯/CFL、卤素、高压钠灯、汞灯和金卤灯；补充材料记录灯泡/灯具型号及测量方式。同一灯管换灯具也有不同记录，部分灯有颜色分带响应。

作者区分完整的波长—时间响应与经过测量器件加权的响应；后者不能无条件移植到任意相机。项目页提供 ZIP 链接；测量主要基于 50 Hz / 220 V，不能自动代表当前所有 PWM 灯具。

**这是本项目补充真实灯光波形最值得检查的资源。**

来源：[项目页](https://www.dgp.toronto.edu/ACam/)、[正文](https://www.cs.toronto.edu/~kyros/pubs/17.cvpr.acam.pdf)、[补充材料与灯具表](https://webee.technion.ac.il/Sites/People/yoav/publications/supplement_ACam_docCVPR.pdf)。



## 版本与相关研究

CVPR 2017 与 [TPAMI 扩展](https://doi.org/10.1109/TPAMI.2019.2903035) 属于同一研究脉络，后者的在线发表与卷期年份不同，不重复计数灯具数据库。[ICCP 2018 的滚动快门工作](/sources/rolling-grid)采用不同相机采样方式，单独登记。

本次引文追踪另发现 [AC 光源分离与本征分解](/sources/ac-intrinsic) 和 [闪烁引导反射去除](/sources/reflection-flicker)。前者逐灯拍摄参考与真实高光值得用于新数据的标定场景；后者全文受限，未补写其参数。

<OriginalReader />
