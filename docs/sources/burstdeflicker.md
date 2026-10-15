---
{
  "title": "BurstDeflicker",
  "updated": "2026-09-16",
  "scenes": [
    "场景照明"
  ],
  "topics": [
    "数据集与真值",
    "去闪论文"
  ],
  "year": 2025,
  "readingStatus": "相关章节已读",
  "accessStatus": "数据入口已提供",
  "checkedAt": "2026-09-16",
  "sourceType": "论文与数据",
  "summary": "静态真实连拍、绿幕动态配对与 Retinex 合成，是场景照明数据的重点参考。",
  "sourceId": "burstdeflicker",
  "canonicalUrl": "https://arxiv.org/abs/2510.09996",
  "attachments": [
    {
      "label": "论文原文",
      "file": "burst_pdf_official.pdf",
      "sha256": "fe27a9605c27a714e0c00e53690da12526d559c0b9f9dc1271c562530b8adc22",
      "redistributable": false
    }
  ]
}
---

# BurstDeflicker


| 子集 | 论文报告 | 真值与生成方式 |
|---|---|---|
| Synthetic | 基于室内图像的可生成数据 | Retinex 模型；稳定环境光与频闪光混合，改变波形、相位和通道幅度 |
| BurstDeflicker-S | 369 个场景、每组 10 连拍；正文另报告约 4,000 张 | 静态场景短曝光 1/1000–1/2000 秒；长曝光 1/50 或 1/60 秒参考，配合 ISO 调整 |
| BurstDeflicker-G | 3,690 张带运动图像 | 将 VideoMatte240K 人物前景合成到真实频闪/干净背景上 |

论文报告按 8:2 划分；代码有 Kaggle 入口。**369×10 与 4,000 的计数口径并不完全一致，采购/整理数据时应实查文件清单。**

该工作的关键启发是保留频闪灯的平均照明，而非删除整盏灯的贡献。局限是绿幕前景没有自动获得与背景相同的三维闪烁照明、投影和镜面反射，短长曝光也改变噪声条件。本项目应针对这些差距补充数据。

来源：[论文 PDF，§3、图 5](https://proceedings.neurips.cc/paper_files/paper/2025/file/4e60c211b3aec6cf8e4866893931efa6-Paper-Datasets_and_Benchmarks_Track.pdf)、[官方代码与数据入口](https://github.com/qulishen/BurstDeflicker)。



## 生成与读取流程的代码证据

本轮核对提交 `fc9aa120243d17b4e62c87f5e75c93bb5ffacda0` 的 [Fine_tune_Loader](https://github.com/qulishen/BurstDeflicker/blob/fc9aa120243d17b4e62c87f5e75c93bb5ffacda0/basicsr/data/fine_tune_dataset.py) 和 [Restormer 配置](https://github.com/qulishen/BurstDeflicker/blob/fc9aa120243d17b4e62c87f5e75c93bb5ffacda0/options/Restormer.yml)。

- 路径按静态 S 与动态 G 的 `input/gt` 目录组织。
- Loader 随机选三帧，间隔为 1–3；静态 GT 取该组参考图，动态 GT 对应第一张输入的时刻。
- 将输入与 GT 拼接后共同做尺寸/旋转/翻转增强；相机抖动作为输入扰动另行加入。
- 配置使用 512×512 尺寸、9 通道输入。三帧堆叠是已有方法的读取协议，不等于新的物理渲染流程。

例：三张 RGB 帧经读取后，`input` 的形状为 `(3,3,512,512)`，`gt` 为 `(3,512,512)`。没有运行训练或下载全套文件。

## 可复现性边界

论文中的静态拍摄、绿幕前景叠加与模型 Loader 是三个不同环节。仓库可读的训练配置不能替代原始灯光测量。GT 中的人物前景缺少与三维背景共同照明产生的投影/反射，这一部分应由新数据补足。

<OriginalReader />
