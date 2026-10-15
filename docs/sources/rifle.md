---
{
  "title": "RIFLE",
  "updated": "2026-09-16",
  "scenes": [
    "屏幕重拍"
  ],
  "topics": [
    "数据集与真值",
    "去闪论文"
  ],
  "year": 2025,
  "readingStatus": "相关章节已读",
  "accessStatus": "数据下载待发布",
  "checkedAt": "2026-09-16",
  "sourceType": "论文与数据",
  "summary": "屏幕单图条带合成；105 对与旧版 60 对的版本口径需要区分。",
  "sourceId": "rifle",
  "canonicalUrl": "https://arxiv.org/abs/2509.24644",
  "attachments": []
}
---

# RIFLE


- 对象：屏幕重拍的单图频闪条带。
- 合成在亮度域构造条带角度、间距、宽度、边缘过渡与噪声；底图来自 LSDIR/UHDM。
- **本轮读取的 v4**：5 类场景，105 对 4096×3072 图像；提取 424 对 512×512 屏幕区域评估块。短长曝光拍摄并配准。
- 其他论文引用的旧版本规模为 60 对，不能与 v4 混用。
- 仓库下载区仍为 **TBD**，不能列为已下载可用数据。

判断：适合比较屏幕条带形态；并不提供真实人物表面多灯照明的物理真值。

来源：[v4 正文 §4.1.2、§5.1](https://arxiv.org/html/2509.24644v4)、[官方仓库](https://github.com/libozhu03/RIFLE)。



<OriginalReader />
