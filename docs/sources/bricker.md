---
{
  "title": "Bricker / BRACE",
  "updated": "2026-09-16",
  "scenes": [
    "屏幕重拍"
  ],
  "topics": [
    "数据集与真值",
    "去闪论文"
  ],
  "year": 2026,
  "readingStatus": "相关章节已读",
  "accessStatus": "数据下载待发布",
  "checkedAt": "2026-09-16",
  "sourceType": "论文与数据",
  "summary": "五帧多曝光 RAW 配对；需区分射线屏幕求交与完整场景光传输。",
  "sourceId": "bricker",
  "canonicalUrl": "https://arxiv.org/abs/2606.29845",
  "attachments": []
}
---

# Bricker / BRACE


- 数据单位：**5 帧多曝光 Bayer RAW + 1 张 GT**。
- 合成：1,000 训练 / 100 测试；真实：250 训练 / 40 测试。
- 虚拟屏幕姿态、相机扫描与显示驱动决定逐像素时间响应；随后加入退化、逆 ISP 和噪声。真实采集使用自动化 Android 拍摄工具及长曝光低 ISO 参考。
- 仓库下载区为 **TODO**，论文的“available”表述尚不能作为下载已可用的证据。

判断：曝光差异和显示分区/颜色驱动值得借鉴；射线与屏幕求交并不自动覆盖完整房间的多次反射、人物材质或真正光谱传输。

来源：[论文 §3.2、实验设置](https://arxiv.org/html/2606.29845)、[官方仓库](https://github.com/ZZH-qwq/BRACE)。



<OriginalReader />
