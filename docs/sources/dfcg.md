---
{
  "title": "DeflickerCycleGAN",
  "updated": "2026-09-16",
  "scenes": [
    "场景照明"
  ],
  "topics": [
    "数据集与真值",
    "去闪论文"
  ],
  "year": 2023,
  "readingStatus": "代码已核对",
  "accessStatus": "生成脚本可获取",
  "checkedAt": "2026-09-16",
  "sourceType": "论文与数据",
  "summary": "单图逐行余弦合成；需要区别代码可得与完整数据公开。",
  "sourceId": "dfcg",
  "canonicalUrl": "https://github.com/YChenL/DFCG",
  "attachments": []
}
---

# DeflickerCycleGAN


- 对象：单张 RGB 图像中的照明/滚动快门频闪。
- 作者仓库提供合成脚本：逐行余弦分量复制到二维，再按三个通道不同幅度加到图像，示例分辨率 256×256。
- 官方脚本包含机器路径、缩进及变量大小写问题；可作为建模线索，不能直接当成已可复现的数据生成包。本轮未发现完整原始数据包入口，不声称其数据规模。
- **对本项目的判断：**颜色通道幅度有区分，但没有三维光传输、灯具空间分布和曝光内运动；同一余弦叠加无法覆盖所需多灯反射场景。

来源：[官方仓库](https://github.com/YChenL/DFCG)、[生成脚本](https://github.com/YChenL/DFCG/blob/main/Dataset/synthesize_data.py)、[论文](https://ieeexplore.ieee.org/document/10006737)。



## 固定提交与代码对应

本轮再次核对 [生成脚本](https://github.com/YChenL/DFCG/blob/9622788d508bb4b8eab7a15208198eb36bf72b1c/Dataset/synthesize_data.py)，提交为 `9622788d508bb4b8eab7a15208198eb36bf72b1c`。

`make_matrix_2D(p)` 将逐行余弦复制到列方向。例：若固定随机相位为 0，p=0.005 时，第 0 行为 1，第 50 行为 -1；每行沿列相同。`read_ENF_img_3c` 把该扰动按三个通道幅度加入已归一化图像，写入脚本中的固定路径。这是图像域加性扰动，不是每个物体对不同灯具的光传输。

没有执行该脚本；缩进、路径和颜色通道等问题需要先修正才能复现。新生成器必须另加时间单位、曝光积分与空间照明定义。

<OriginalReader />
