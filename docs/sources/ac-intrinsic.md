---
{
  "title": "AC 照明下的光源分离与本征分解",
  "sourceId": "ac-intrinsic",
  "sourceType": "论文与数据",
  "canonicalUrl": "https://openaccess.thecvf.com/content/CVPR2023/html/Yoshida_Light_Source_Separation_and_Intrinsic_Image_Decomposition_Under_AC_Illumination_CVPR_2023_paper.html",
  "summary": "镜面和漫反射共同影响多光源的分离与颜色辨识。",
  "topics": [
    "材质与运动",
    "数据集与真值",
    "光谱与颜色"
  ],
  "scenes": [
    "场景照明"
  ],
  "readingStatus": "相关章节已读",
  "accessStatus": "原文可访问",
  "checkedAt": "2026-09-16",
  "updated": "2026-09-16",
  "year": 2023,
  "attachments": [
    {
      "label": "原始文档",
      "file": "r2_ac-intrinsic.pdf",
      "sha256": "90b1c4a2780952d5c488a0db327cdfbf4762c9332f8d883bb29d78cb70484c30",
      "redistributable": false
    }
  ],
  "evidenceHash": "90b1c4a2780952d5c488a0db327cdfbf4762c9332f8d883bb29d78cb70484c30",
  "discoveredBy": "Q039"
}
---

# AC 照明下的光源分离与本征分解

镜面和漫反射共同影响多光源的分离与颜色辨识。

## 阅读范围

精读 CVPR 2023 正文的成像假设、§4.1–4.3 与局限。

## 采集和合成

合成使用物体几何和 DELIGHT 时间响应，含两灯、不同颜色/方向的受控案例。真实实验以 FASTCAM Mini UX50、2500 fps、0.4 ms 采集，灯具为卤素与 LED；逐灯点亮得到贡献参考，并用白色靶标测光源颜色。

## 对数据集的意义

可借鉴逐灯参考与颜色标定；这是光源/本征分解实验，不是大规模动态去频闪基准。其二色反射及可观测性假设不能推广到所有材质/遮挡。

<OriginalReader />
