---
{
  "title": "Blind Video Deflickering",
  "updated": "2026-09-16",
  "scenes": [
    "通用视频"
  ],
  "topics": [
    "数据集与真值",
    "去闪论文"
  ],
  "year": 2023,
  "readingStatus": "相关章节已读",
  "accessStatus": "数据入口已提供",
  "checkedAt": "2026-09-16",
  "sourceType": "论文与数据",
  "summary": "297 个混合来源的视频条目；真实视频通常没有干净真值。",
  "sourceId": "all-in-one",
  "canonicalUrl": "https://arxiv.org/abs/2303.08120",
  "attachments": [
    {
      "label": "论文原文",
      "file": "all_in_one.pdf",
      "sha256": "158e170d7b9782f3731235e7b9afea7217ad492d31abd3db8e39c055eb6d480a",
      "redistributable": false
    }
  ]
}
---

# Blind Video Deflickering


论文统计：老电影 20、老动画 10、慢动作 10、延时 10、逐帧处理视频 157、合成视频 90，共 **297 个条目**。真实视频一般没有干净 GT，合成视频来自稳定视频施加退化。

适合覆盖此前实际修复的通用问题，但不能从这些条目推断灯频、读出时间、真实光谱或材质参数。它的来源混杂，应作为额外真实测试集合的一部分。

来源：[论文 §4](https://arxiv.org/abs/2303.08120)、[作者仓库](https://github.com/ChenyangLEI/All-In-One-Deflicker)、[作者提供的数据镜像](https://huggingface.co/datasets/xrenaa/Blind-Video-Deflickering-Dataset)。



<OriginalReader />
